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
import Schema$Event = calendar_v3.Schema$Event;
import WriteBatch = admin.firestore.WriteBatch;
import Timestamp = admin.firestore.Timestamp;
import DocumentReference = admin.firestore.DocumentReference;

export class TaskFunctions {

    async createCalendarEvent(snapshot: DocumentSnapshot) {
        const taskItem = deserialize(snapshot.data(), Task);
        if (taskItem.nextRepetitionDate && taskItem.user) {
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
        console.info("Started: updateCalendarEvents");
        const taskItem = deserialize(snapshot.data(), Task);
        if (taskItem.nextRepetitionDate && taskItem.user) {
            const builder = new CEBPlanedTask(taskItem);
            const event = new CalendarEventCreator(builder).create().get();
            const eventCollection = snapshot.ref.collection(FirestoreCollection.CalendarEvents);

            return eventCollection.get().then(eventsSnapshot => {
                const batch = admin.firestore().batch();
                const eventsRefs = eventsSnapshot.docs
                    .map(doc => admin.firestore().collection(FirestoreCollection.CalendarEvents).doc(doc.id));
                eventsRefs.forEach(ref => batch.update(ref, {'event_data': serialize(event)}));
                console.info("Finished: updateCalendarEvents");
                return batch.commit();
            });
        } else {
            console.info("Finished: updateCalendarEvents");
            return this.deleteCalendarEvents(snapshot)
        }
    }

    createTaskInListCollection(snapshot: DocumentSnapshot, batch: WriteBatch) {
        if (snapshot === null || !snapshot.exists) return;
        const taskItem = deserialize(snapshot.data(), Task);
        if (taskItem.list) {
            const docRef = taskItem.list.collection(FirestoreCollection.Tasks).doc(snapshot.id);
            batch.set(docRef, snapshot.data()!);
        }
    }

    deleteTaskInListCollection(snapshot: DocumentSnapshot, batch: WriteBatch) {
        if (snapshot === null || !snapshot.exists) return;
        const taskItem = deserialize(snapshot.data(), Task);
        if (taskItem.list) {
            const docRef = taskItem.list.collection(FirestoreCollection.Tasks).doc(snapshot.id);
            batch.delete(docRef);
        }
    }

    updateTaskInListCollection(change: Change<DocumentSnapshot>, batch: WriteBatch) {
        console.info("Started: updateTaskInListCollection");
        const itemBefore = deserialize(change.before.data(), Task);
        const itemAfter = deserialize(change.after.data(), Task);

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
        console.info("Finished: updateTaskInListCollection");
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

        return taskListRef.update({"date_to_do": newDate});
    }

    /**
     * Изменяет количество задач в связанных объектах при изменении задачи
     * @param before
     * @param after
     * @param batch
     */
    updateTaskInHouseCount(before: DocumentSnapshot, after: DocumentSnapshot, batch: WriteBatch) {
        console.info("Started: updateTaskInHouseCount");
        const itemBefore = deserialize(before.data(), Task);
        const itemAfter = deserialize(after.data(), Task);

        if (itemBefore.object !== undefined
            && itemAfter.object !== undefined
            && itemBefore.object!.path === itemAfter.object!.path)
            return;

        this.incrementTaskInHouseCount(after, batch);
        this.decrementTaskInHouseCount(before, batch);
        console.info("Finished: updateTaskInHouseCount");
    }

    /**
     * Увеличивает счётчик количества задач в связанном объекте
     * @param snapshot
     * @param batch
     */
    incrementTaskInHouseCount(snapshot: DocumentSnapshot, batch?: WriteBatch) {
        const item = deserialize(snapshot.data(), Task);
        if (item.object === undefined) return Promise.resolve();
        if (batch !== undefined) {
            Helper.firestore().incrementFieldWithBatch(batch, item.object, "tasks_count");
            return
        }
        return Helper.firestore().incrementField(item.object, "tasks_count")
    }

    /**
     * Уменьшает счётчик количества задач в связанном объекте
     * @param snapshot
     * @param batch
     */
    decrementTaskInHouseCount(snapshot: DocumentSnapshot, batch?: WriteBatch) {
        const item = deserialize(snapshot.data(), Task);
        if (item.object === undefined) return Promise.resolve();
        if (batch !== undefined) {
            Helper.firestore().decrementFieldWithBatch(batch, item.object, "tasks_count");
            return
        }
        return Helper.firestore().decrementField(item.object, "tasks_count")
    }


    /**
     * Увеличивает счетчик количества задач в списке дел на 1
     * @param snapshot
     * @param batch
     */
    incrementTotalInListCount(snapshot: DocumentSnapshot, batch: WriteBatch) {
        const listRef = snapshot.ref.parent.parent;
        if (!listRef) return;
        Helper.firestore().incrementFieldWithBatch(batch, listRef, "items_count")
    }

    /**
     * Увеличивает счётчик готовых задач в списке дел
     * @param snapshot
     * @param batch
     */
    incrementCompetedInListCount(snapshot: DocumentSnapshot, batch: WriteBatch) {
        const listRef = snapshot.ref.parent.parent;
        const taskItem = deserialize(snapshot.data(), Task);
        if (!listRef || !taskItem.isDone) return;
        Helper.firestore().incrementFieldWithBatch(batch, listRef, "done_item_count")
    }

    /**
     * Уменьшает счетчик количества задач в списке дел на 1
     * @param snapshot
     * @param batch
     */
    decrementTotalInListCount(snapshot: DocumentSnapshot, batch: WriteBatch) {
        const listRef = snapshot.ref.parent.parent;
        if (!listRef) return;
        Helper.firestore().decrementFieldWithBatch(batch, listRef, "items_count")
    }

    /**
     * Уменьшает колчиество готовых зада в списке дел при удалении
     * @param snapshot
     * @param batch
     */
    decrementCompetedInListCount(snapshot: DocumentSnapshot, batch: WriteBatch) {
        const listRef = snapshot.ref.parent.parent;
        const taskItem = deserialize(snapshot.data(), Task);
        if (!listRef || !taskItem.isDone) return;
        Helper.firestore().decrementFieldWithBatch(batch, listRef, "done_item_count")
    }

    updateCompletedTaskInListCount(change: Change<DocumentSnapshot>): Promise<any> {
        const itemBefore = deserialize(change.before.data(), Task);
        const itemAfter = deserialize(change.after.data(), Task);
        const listRef = change.after.ref.parent.parent;
        if (!listRef) return Promise.resolve();
        let inc = 0;
        if (itemBefore.isDone && !itemAfter.isDone) inc = -1;
        if (!itemBefore.isDone && itemAfter.isDone) inc = 1;
        return Helper.firestore().incrementField(listRef, "done_item_count", inc)
    }

    /**
     * Создаёт уведомление о необходимости выоплнить запланированное дело
     * @param snapshot
     */
    createOnToDoCaseNotification(snapshot: DocumentSnapshot): Promise<any> {
        console.info("Started: deleteRelatedNotifications");
        const caseToDo = deserialize(snapshot.data(), Task);
        const uid = caseToDo.user.id;

        const notificationBuilder = new CaseToDoNotifBuilder(uid, snapshot.ref, caseToDo);
        const notificationCreator = new NotificationCreator(notificationBuilder);

        const notification = notificationCreator.construct().get();

        console.info("Finished: deleteRelatedNotifications");
        return admin.firestore().collection(FirestoreCollection.Notifications).doc().create(serialize(notification));
    }

    updateChecker(change: Change<DocumentSnapshot>): WriteBatch {
        const batch = admin.firestore().batch();

        const taskBefore = deserialize(change.before.data(), Task);
        const taskAfter = deserialize(change.after.data(), Task);

        const isNextRepetitionDateChanged: boolean =
            taskBefore.nextRepetitionDate !== undefined
            && (taskAfter.nextRepetitionDate === undefined || taskBefore.nextRepetitionDate.toMillis() !== taskAfter.nextRepetitionDate.toMillis());

        const isIsDoneChangedToTrue: boolean = taskBefore.isDone === false && taskAfter.isDone === true;
        const isIsDoneChangedToFalse: boolean = taskBefore.isDone === true && taskAfter.isDone === false;

        console.debug("Is 'nextRepetitionDate' changed = " + isNextRepetitionDateChanged);
        console.debug("Is 'isDone' changed to 'true' = " + isIsDoneChangedToTrue);
        console.debug("Is 'isDone' changed to 'false' = " + isIsDoneChangedToFalse);

        const eventTime = Timestamp.now();

        console.debug("Event time = " + eventTime.toDate().toISOString());

        if (isNextRepetitionDateChanged || isIsDoneChangedToFalse) {
            this.deleteChecker(undefined, change.before.ref, taskBefore, batch);
        }

        if (isIsDoneChangedToTrue && taskAfter.nextRepetitionDate) {

            console.debug("Next repetition date = " + taskAfter.nextRepetitionDate.toDate().toISOString());

            if (eventTime.toMillis() > taskAfter.nextRepetitionDate.toMillis()) {
                this.resetChecker(undefined, change.after.ref, taskAfter, batch)
            } else {
                const scheduleTaskReference = this.getScheduleTaskReference(taskAfter.nextRepetitionDate, change.after.id);
                batch.set(scheduleTaskReference, change.after.data()!)
            }
        }

        return batch
    }

    resetChecker(snapshot?: DocumentSnapshot, _ref?: DocumentReference, _task?: Task, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const task = _task || deserialize(snapshot!.data(), Task);
        const ref = _ref || snapshot!.ref;
        const eventTime = Timestamp.now();

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

    deleteChecker(snapshot?: DocumentSnapshot, _ref?: DocumentReference, _task?: Task, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const task = _task || deserialize(snapshot!.data(), Task);
        const ref = _ref || snapshot!.ref;
        const nextDateToDo = task.nextRepetitionDate;
        if (nextDateToDo) {
            const scheduleTaskReference = this.getScheduleTaskReference(nextDateToDo, ref.id);
            batch.delete(scheduleTaskReference);
        }
        batch.update(ref, {"is_done": false});
        return batch
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
