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
        const taskItem = deserialize(snapshot.data(), Task);
        if (taskItem.list) {
            const docRef = taskItem.list.collection(FirestoreCollection.Tasks).doc(snapshot.id);
            batch.set(docRef, snapshot.data()!);
        }
        return batch;
    }

    deleteTaskInListCollection(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        if (snapshot === null || !snapshot.exists) return batch;
        const taskItem = deserialize(snapshot.data(), Task);
        if (taskItem.list) {
            const docRef = taskItem.list.collection(FirestoreCollection.Tasks).doc(snapshot.id);
            batch.delete(docRef);
        }
        return batch;
    }

    updateTaskInListCollection(change: Change<DocumentSnapshot>, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
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
     * Изменяет количество задач в связанных объектах если это необходимо
     * @param before
     * @param after
     * @param _batch
     */
    updateTasksCountInHouse(before: DocumentSnapshot, after: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();

        const itemBefore = deserialize(before.data(), Task);
        const itemAfter = deserialize(after.data(), Task);

        // If objects are equal or undefined do nothing
        if (itemBefore.object !== itemAfter.object
            && itemBefore.object !== undefined
            && itemAfter.object !== undefined
            && itemBefore.object!.path === itemAfter.object!.path)
            return batch;

        // If objects are not equal and object before not undefined decrement tasks count in this object
        if (itemBefore.object !== undefined) {
            this.decrementTaskInHouseCount(before, batch);
        }

        // If objects are not equal and object after not undefined increment tasks count in this object
        if (itemAfter.object !== undefined) {
            this.incrementTaskInHouseCount(after, batch);
        }

        return batch
    }

    /**
     * Updating completed task count in relative objects if needed
     * @param before
     * @param after
     * @param _batch
     */
    updateCompletionTasksCountInHouse(before: DocumentSnapshot, after: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();

        const itemBefore = deserialize(before.data(), Task);
        const itemAfter = deserialize(after.data(), Task);

        const beforeDone = itemBefore.isDone;
        const afterDone = itemAfter.isDone;

        // If task before and task after not checked do nothing
        if (beforeDone === false && afterDone === false) return batch;

        // If task before and task after checked and object changed increment checked
        // tasks count in object after and decrement tasks count in object before
        if (beforeDone === afterDone) {

            // If objects are equal or undefined do nothing
            if (itemBefore.object !== itemAfter.object
                && itemBefore.object !== undefined
                && itemAfter.object !== undefined
                && itemBefore.object!.path === itemAfter.object!.path)
                return batch;

            // If objects are not equal and object before not undefined decrement tasks count in this object
            this.decrementCompetedTaskCountInHousing(before, batch);

            // If objects are not equal and object after not undefined increment tasks count in this object
            this.incrementCompetedTaskCountInHousing(after, batch);

            return batch;
        }

        const isChecked = (beforeDone === undefined || !beforeDone) && afterDone === true;

        // If task was checked increment completed task count in object after
        // Else decrement completed task count in object before
        if (isChecked) {
            this.incrementCompetedTaskCountInHousing(after, batch)
        } else {
            this.decrementCompetedTaskCountInHousing(before, batch)
        }

        return batch;
    }

    /**
     * Updating completed task count in relative task list if needed
     * @param before
     * @param after
     * @param _batch
     */
    updateCompletionTasksCountInTaskList(before: DocumentSnapshot, after: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();

        const itemBefore = deserialize(before.data(), Task);
        const itemAfter = deserialize(after.data(), Task);

        const beforeDone = itemBefore.isDone;
        const afterDone = itemAfter.isDone;

        // If task before and task after not checked do nothing
        if (beforeDone === false && afterDone === false) return batch;

        // If task before and task after checked and task list changed increment checked
        // tasks count in task list after and decrement tasks count in task list before
        if (beforeDone === afterDone) {

            // If objects are equal or undefined do nothing
            if (itemBefore.object !== itemAfter.object
                && itemBefore.object !== undefined
                && itemAfter.object !== undefined
                && itemBefore.object!.path === itemAfter.object!.path)
                return batch;

            // If objects are not equal and task list before not undefined decrement tasks count in this task list
            this.decrementCompetedTasksCountInTaskList(before, batch);

            // If objects are not equal and task list after not undefined increment tasks count in this task list
            this.incrementCompetedTasksCountInTaskList(after, batch);

            return batch;
        }

        const isChecked = (beforeDone === undefined || !beforeDone) && afterDone === true;

        // If task was checked increment completed task count in task list after
        // Else decrement completed task count in task list before
        if (isChecked) {
            this.incrementCompetedTasksCountInTaskList(after, batch)
        } else {
            this.decrementCompetedTasksCountInTaskList(before, batch)
        }

        return batch;
    }

    /**
     * Updating tasks count in task list before and after
     * @param before
     * @param after
     * @param _batch
     */
    updateTasksCountInTaskList(before: DocumentSnapshot, after: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();

        const itemBefore = deserialize(before.data(), Task);
        const itemAfter = deserialize(after.data(), Task);

        // If lists are equal or undefined do nothing
        if (itemBefore.list !== itemAfter.list
            && itemBefore.list !== undefined
            && itemAfter.list !== undefined
            && itemBefore.list.path === itemAfter.list.path
        ) return batch;

        // If lists are not equal and list after not undefined increment tasks count in this list 
        if (itemAfter.list !== undefined) {
            this.incrementTotalInListCount(after, batch);
        }

        // If lists are not equal and list before not undefined decrement tasks count in this list 
        if (itemBefore.list !== undefined) {
            this.decrementTotalInListCount(before, batch);
        }

        return batch
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

        const itemBefore = deserialize(before.data(), Task);
        const itemAfter = deserialize(after.data(), Task);

        const beforeDone = itemBefore.isDone;
        const afterDone = itemAfter.isDone;

        const isChecked = (beforeDone === undefined || !beforeDone) && afterDone === true;
        const isUnChecked = (beforeDone === true) && (afterDone === undefined || !afterDone);

        // Next iteration date need to update only when task was checked (false -> true) and setup fields:
        // - repetitionRateMultiplier
        // - repetitionRateTimeInterval
        // - nextRepetitionDate
        if (itemAfter.repetitionRateMultiplier === undefined
            || itemAfter.repetitionRateTimeInterval === undefined
            || itemAfter.nextRepetitionDate === undefined)
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
        const item = deserialize(snapshot.data(), Task);
        if (item.object === undefined) return batch;
        return Helper.firestore().incrementFieldWithBatch(batch, item.object, "tasks_count");
    }

    /**
     * Уменьшает счётчик количества задач в связанном объекте
     * @param snapshot
     * @param _batch
     */
    decrementTaskInHouseCount(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = deserialize(snapshot.data(), Task);
        if (item.object === undefined) return batch;
        return Helper.firestore().decrementFieldWithBatch(batch, item.object, "tasks_count");
    }

    /**
     * Увеличивает счётчик готовых задач в объекте если задача помечена как выполенная
     * @param snapshot
     * @param _batch
     */
    incrementCompetedTaskCountInHousing(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = deserialize(snapshot.data(), Task);
        const ref = item.object;
        if (!ref || item.isDone !== true) return batch;
        return Helper.firestore().incrementFieldWithBatch(batch, ref, "done_task_count")
    }

    /**
     * Уменьшает счётчик готовых задач в объекте если задача помечена как выполенная
     * @param snapshot
     * @param _batch
     */
    decrementCompetedTaskCountInHousing(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = deserialize(snapshot.data(), Task);
        const ref = item.object;
        if (!ref || item.isDone !== true) return batch;
        return Helper.firestore().incrementFieldWithBatch(batch, ref, "done_task_count")
    }

    /**
     * Увеличивает счетчик количества задач в списке дел на 1
     * @param snapshot
     * @param _batch
     */
    incrementTotalInListCount(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = deserialize(snapshot.data(), Task);
        const listRef = item.list;
        if (!listRef) return batch;
        Helper.firestore().incrementFieldWithBatch(batch, listRef, "items_count");
        return batch;
    }

    /**
     * Увеличивает счётчик готовых задач в списке дел
     * @param snapshot
     * @param _batch
     */
    incrementCompetedTasksCountInTaskList(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = deserialize(snapshot.data(), Task);
        const listRef = item.list;
        if (!listRef || !item.isDone) return batch;
        return Helper.firestore().incrementFieldWithBatch(batch, listRef, "done_item_count");
    }

    /**
     * Уменьшает счетчик количества задач в списке дел на 1
     * @param snapshot
     * @param _batch
     */
    decrementTotalInListCount(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = deserialize(snapshot.data(), Task);
        const listRef = item.list;
        if (!listRef) return batch;
        return Helper.firestore().decrementFieldWithBatch(batch, listRef, "items_count")
    }

    /**
     * Уменьшает колчиество готовых зада в списке задач если задача помечена как выполненая
     * @param snapshot
     * @param _batch
     */
    decrementCompetedTasksCountInTaskList(snapshot: DocumentSnapshot, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = deserialize(snapshot.data(), Task);
        const listRef = item.list;
        if (!listRef || item.isDone !== true) return batch;
        return Helper.firestore().decrementFieldWithBatch(batch, listRef, "done_item_count")
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

        if (isIsDoneChangedToTrue
            && taskAfter.repetitionRateMultiplier
            && taskAfter.repetitionRateTimeInterval
            && taskAfter.nextRepetitionDate) {

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
