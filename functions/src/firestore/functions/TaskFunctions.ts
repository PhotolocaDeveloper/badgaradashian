import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize, serialize} from "typescript-json-serializer";
import {Task} from "../../classses/model/Task";
import {CaseToDoNotifBuilder} from "../../classses/builders/notifications/CaseToDoNotifBuilder";
import {NotificationCreator} from "../../classses/creators/NotificationCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";
import {Change} from "firebase-functions";
import {CEBPlanedTask} from "../../classses/builders/calendarEvents/CEBPlanedTask";
import {CalendarEventCreator} from "../../classses/creators/CalendarEventCreator";
import {CalendarEventWrapper} from "../../classses/model/CalendarEventWrapper";
import {calendar_v3} from "googleapis";
import {Functions} from "../Functions";
import {UpdateMethod} from "./CountableFunctions";
import Schema$Event = calendar_v3.Schema$Event;
import WriteBatch = admin.firestore.WriteBatch;
import Timestamp = admin.firestore.Timestamp;
import DocumentReference = admin.firestore.DocumentReference;

export class TaskFunctions {

    async createCalendarEvent(snapshot: DocumentSnapshot) {
        const taskItem = Helper.firestore().deserialize(snapshot, Task);
        if (taskItem !== undefined && taskItem.nextRepetitionDate && taskItem.user) {
            const builder = new CEBPlanedTask(taskItem);
            const event = new CalendarEventCreator(builder).create().get();
            return this.saveCalendarEvent(event, taskItem.user, snapshot.ref);
        }
        return Promise.resolve()
    }

    async saveCalendarEvent(event: Schema$Event, user: admin.firestore.DocumentReference, relatedObject: admin.firestore.DocumentReference) {
        const eventWrapper = new CalendarEventWrapper();
        eventWrapper.event = event;
        eventWrapper.user = user;
        eventWrapper.relativeObject = relatedObject;
        return admin.firestore().collection(FirestoreCollection.CalendarEvents).doc().set(serialize(eventWrapper));
    }

    deleteCalendarEvents(snapshot: DocumentSnapshot) {
        return admin.firestore().runTransaction(t => {
            const eventCollection = snapshot.ref.collection(FirestoreCollection.CalendarEvents);
            return t.get(eventCollection).then(eventsSnapshot => {
                const eventsRefs = eventsSnapshot.docs
                    .map(doc => admin.firestore().collection(FirestoreCollection.CalendarEvents).doc(doc.id));
                eventsRefs.forEach(ref => t.delete(ref));
            })
        });
    }

    updateCalendarEvents(snapshot: DocumentSnapshot) {
        const taskItem = Helper.firestore().deserialize(snapshot, Task);
        if (taskItem === undefined) return Promise.resolve();
        if (taskItem.nextRepetitionDate && taskItem.user) {
            const builder = new CEBPlanedTask(taskItem);
            const event = new CalendarEventCreator(builder).create().get();
            const eventCollection = snapshot.ref.collection(FirestoreCollection.CalendarEvents);

            return eventCollection.get().then(eventsSnapshot => {
                const batch = admin.firestore().batch();
                const eventsRefs = eventsSnapshot.docs
                    .map(doc => admin.firestore().collection(FirestoreCollection.CalendarEvents).doc(doc.id));
                eventsRefs.forEach(ref => batch.update(ref, {'event_data': serialize(event)}));
                return batch.commit();
            });
        } else {
            return this.deleteCalendarEvents(snapshot)
        }
    }

    /**
     * Copy task to local collection
     * @param snapshot
     * @param _batch
     */
    createTaskInListCollection(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        if (snapshot === null || !snapshot.exists) return batch;
        const taskItem = Helper.firestore().deserialize(snapshot, Task);
        if (taskItem !== undefined && taskItem.list) {
            const docRef = taskItem.list.collection(FirestoreCollection.Tasks).doc(snapshot.id);
            batch.set(docRef, snapshot.data()!);
        }
        return batch;
    }

    deleteTaskInListCollection(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const taskItem = Helper.firestore().deserialize(snapshot, Task);
        if (taskItem !== undefined && taskItem.list) {
            const docRef = taskItem.list.collection(FirestoreCollection.Tasks).doc(snapshot.id);
            batch.delete(docRef);
        }
        return batch;
    }

    updateTaskInListCollection(change: Change<DocumentSnapshot>, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();

        const dataBefore = Helper.firestore().deserialize(change.before, Task);
        const dataAfter = Helper.firestore().deserialize(change.after, Task);

        if (dataBefore === undefined || dataAfter === undefined) {
            return batch;
        }

        const itemBefore = deserialize(dataBefore, Task);
        const itemAfter = deserialize(dataAfter, Task);

        const beforeListRef = itemBefore.list;
        const afterListRef = itemAfter.list;

        const beforeListPath = beforeListRef === undefined ? undefined : beforeListRef.path;
        const afterListPath = afterListRef === undefined ? undefined : afterListRef.path;

        if (beforeListPath !== afterListPath) {
            this.deleteTaskInListCollection(change.before, batch);
            this.createTaskInListCollection(change.after, batch);
            return batch
        }

        if (afterListRef !== undefined) {
            const docRef = afterListRef.collection(FirestoreCollection.Tasks).doc(change.after.id);
            const data = change.after.data()!;
            batch.update(docRef, data)
        }
        return batch
    }

    async updateDateToDoInList(snapshot: DocumentSnapshot) {
        if (!snapshot || !snapshot.exists) return Promise.resolve();

        const tasksCollection = snapshot.ref.parent;
        const taskListRef = tasksCollection.parent;

        if (!taskListRef) return Promise.resolve();

        const querySnapshot = await tasksCollection
            .orderBy("date_to_do", "desc")
            .limit(1)
            .get();

        let newDate = undefined;
        const firstItem = querySnapshot.docs.pop();

        if (firstItem) {
            const task = deserialize(firstItem.data(), Task);
            newDate = task.dateToDo
        }

        if (newDate !== undefined) {
            return taskListRef.update({"date_to_do": newDate});
        } else {
            return Promise.resolve();
        }

    }

    /**
     * Update count of completed tasks in relative object when task's state changed
     * is_done = (true -> false) or (false -> true)
     * @param change
     * @param refField
     * @param counterField
     * @param batch
     */
    updateCompletionCountInRelativeObject(
        change: Change<DocumentSnapshot>,
        refField: string,
        counterField: string,
        batch: WriteBatch = admin.firestore().batch()
    ): WriteBatch {
        return Functions.countable()
            .multiplyUpdate(Task, refField, counterField)
            .setSnapshots([change.before, change.after])
            .setBatch(batch)
            .setConditions(values => {
                const beforeDone = values[0].isDone || false;
                const afterDone = values[1].isDone || false;
                const isChecked = !beforeDone && afterDone;
                const isUnChecked = !afterDone && beforeDone;
                if (isChecked) return [UpdateMethod.None, UpdateMethod.Increment];
                if (isUnChecked) return [UpdateMethod.Decrement, UpdateMethod.None];
                return null
            })
            .update();
    }

    /**
     * Update count of completed tasks in relative object if it was change and
     * task was mark as completed
     * @param change
     * @param refField
     * @param counterField
     * @param reference
     * @param batch
     */
    updateCompletionCountWhenRelativeObjectChanged(
        change: Change<DocumentSnapshot>,
        refField: string,
        counterField: string,
        reference: (task: Task) => DocumentReference | undefined,
        batch: WriteBatch = admin.firestore().batch()
    ): WriteBatch {
        return Functions.countable()
            .move(Task, change.before, change.after, refField, counterField)
            .setBatch(batch)
            .setCondition((valueFrom, valueTo) => {
                const relativeObjectFrom = reference(valueFrom);
                const relativeObjectTo = reference(valueTo);
                return valueFrom.isDone === true && valueTo.isDone === true
                    && !(relativeObjectFrom !== relativeObjectTo
                        && relativeObjectFrom !== undefined
                        && relativeObjectTo !== undefined
                        && relativeObjectFrom.path === relativeObjectTo.path)
            })
            .move();
    }

    /**
     * Decrement count of tasks in related object before
     * and increment tasks count in related object  after
     * if its was change
     * @param change
     * @param refField
     * @param counterField
     * @param reference
     * @param batch
     */
    updateCountInRelativeObject(
        change: Change<DocumentSnapshot>,
        refField: string,
        counterField: string,
        reference: (task: Task) => DocumentReference | undefined,
        batch: WriteBatch = admin.firestore().batch()
    ): WriteBatch {
        return Functions.countable()
            .move(Task, change.before, change.after, refField, counterField)
            .setBatch(batch)
            .setCondition((valueFrom, valueTo) => {
                const relativeObjectFrom = reference(valueFrom);
                const relativeObjectTo = reference(valueTo);
                return !(relativeObjectFrom !== relativeObjectTo
                    && relativeObjectFrom !== undefined
                    && relativeObjectTo !== undefined
                    && relativeObjectFrom.path === relativeObjectTo.path)
            })
            .move();
    }

    /**
     * Reset checked value and change next repetition date or create reset event in schedule
     * when task set checked (false -> true)
     * @param before
     * @param after
     * @param _batch
     */
    updateTasksNextIterationDate(before: DocumentSnapshot, after: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();

        const itemBefore = Helper.firestore().deserialize(before, Task);
        const itemAfter = Helper.firestore().deserialize(after, Task);

        const beforeDone = itemBefore?.isDone;
        const afterDone = itemAfter?.isDone;

        const isChecked = (beforeDone === undefined || !beforeDone) && afterDone === true;
        const isUnChecked = (beforeDone === true) && (afterDone === undefined || !afterDone);

        // Next iteration date need to update only when task was checked (false -> true) and setup fields:
        // - repetitionRateMultiplier
        // - repetitionRateTimeInterval
        // - nextRepetitionDate
        if (itemAfter?.repetitionRateMultiplier === undefined
            || itemAfter?.repetitionRateTimeInterval === undefined
            || itemAfter?.nextRepetitionDate === undefined)
            return batch;

        const eventTime = admin.firestore.Timestamp.now();
        const nextRepetitionDate = itemAfter.nextRepetitionDate;

        // If task was checked (false -> true) reset checked state or insert resetting task in schedule
        if (isChecked) {
            // If task checked after nextRepetitionDate reset checker now
            // Else insert resetting task in schedule
            if (eventTime.toMillis() > nextRepetitionDate.toMillis()) {
                this.resetChecker(undefined, after.ref, itemAfter, batch)
            } else {
                const scheduleTaskReference = this.getScheduleTaskReference(nextRepetitionDate, after.id);
                batch.set(scheduleTaskReference, after.data()!)
            }
        }

        // If task was unchecked (true -> false) and event was after nextRepetitionDate
        // need to delete resetting task form schedule
        if (isUnChecked && nextRepetitionDate.toMillis() < eventTime.toMillis()) {
            const scheduleTaskReference = this.getScheduleTaskReference(nextRepetitionDate, after.id);
            batch.delete(scheduleTaskReference);
        }

        return batch;
    }

    /**
     * Увеличивает счётчик количества задач в связанном объекте
     * @param snapshot
     * @param _batch
     */
    incrementTaskInHouseCount(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = Helper.firestore().deserialize(snapshot, Task);
        if (item?.object === undefined) return batch;
        return Helper.firestore().incrementFieldWithBatch(batch, item.object, "tasks_count");
    }

    /**
     * Уменьшает счётчик количества задач в связанном объекте
     * @param snapshot
     * @param _batch
     */
    decrementTaskInHouseCount(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = Helper.firestore().deserialize(snapshot, Task);
        if (item?.object === undefined) return batch;
        return Helper.firestore().decrementFieldWithBatch(batch, item.object, "tasks_count");
    }

    /**
     * Создаёт уведомление о необходимости выоплнить запланированное дело
     * @param snapshot
     */
    createOnToDoCaseNotification(snapshot: DocumentSnapshot): Promise<any> {
        const caseToDo = Helper.firestore().deserialize(snapshot, Task);
        const uid = caseToDo?.user.id;

        if (!uid) {
            return Promise.reject("UID is empty");
        }

        if (!caseToDo) {
            return Promise.reject("Task not found");
        }

        const notificationBuilder = new CaseToDoNotifBuilder(uid, snapshot.ref, caseToDo);
        const notificationCreator = new NotificationCreator(notificationBuilder);

        const notification = notificationCreator.construct().get();

        return admin.firestore().collection(FirestoreCollection.Notifications).doc().create(serialize(notification));
    }


    resetChecker(snapshot?: DocumentSnapshot, _ref?: DocumentReference, _task?: Task, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const task = _task || Helper.firestore().deserialize(snapshot!, Task);
        const ref = _ref || snapshot!.ref;
        const eventTime = Timestamp.now();

        if (!task) {
            return batch;
        }

        task.isDone = false;

        if (task.nextRepetitionDate) {
            task.lastRepetitionDate = task.nextRepetitionDate
        }

        if (task.dateToDo && task.repetitionRateMultiplier && task.repetitionRateTimeInterval) {
            const nextRepetitionDate = Helper.date()
                .calculateNextRepetitionDate(
                    task.dateToDo.toDate(),
                    eventTime.toDate(),
                    task.repetitionRateTimeInterval,
                    task.repetitionRateMultiplier);
            task.nextRepetitionDate = Timestamp.fromDate(nextRepetitionDate);
        }

        batch.set(ref, serialize(task), {merge: true});
        return batch;
    }

    getScheduleCollection(timestamp: admin.firestore.Timestamp): admin.firestore.CollectionReference {
        const nextDateToDoString = Helper.firestore().scheduleId(timestamp);
        return admin.firestore()
            .collection(FirestoreCollection.TaskChangeSchedule).doc(nextDateToDoString)
            .collection(FirestoreCollection.Tasks)
    }

    getScheduleTaskReference(timestamp: admin.firestore.Timestamp, taskId: string): admin.firestore.DocumentReference {
        return this.getScheduleCollection(timestamp).doc(taskId);
    }


}
