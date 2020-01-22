import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {Task} from "../../classses/model/Task";
import {TaskList} from "../../classses/model/TaskList";
import {Housing} from "../../classses/model/Housing";
import {Helper} from "../../classses/helpers/Helper";

export class TaskHandler {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            // Create notification
            Functions.task().createOnToDoCaseNotification(snapshot),
            // Create calendar event
            Functions.task().createCalendarEvent(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            // Deleting related notifications
            Functions.general().deleteRelatedNotifications(snapshot),
            // Deleting related photos
            Functions.general().deleteRelatedPhotos(snapshot),
            // Deleting related calendar events
            Functions.task().deleteCalendarEvents(snapshot)
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const caseToDoBefore = Helper.firestore().deserialize(change.before, Task);
        const caseToDoAfter = Helper.firestore().deserialize(change.after, Task);

        const promises: Promise<any>[] = [];

        // Update related notification if `nextRepetitionDate` was changed
        if (caseToDoAfter?.nextRepetitionDate !== caseToDoBefore?.nextRepetitionDate) {
            promises.concat([
                Functions.general().deleteRelatedNotifications(change.before),
                Functions.task().createOnToDoCaseNotification(change.after)
            ]);
        }

        promises.concat([
            // Update calendar event
            Functions.task().updateCalendarEvents(change.after),
        ]);

        return Promise.all(promises)
    }

    updateTaskCounters(change: Change<DocumentSnapshot>): Promise<any> {

        // Update tasks count in task list if needed
        const taskCountInListUpdateBatch = Functions.task()
            .updateCountInRelativeObject(
                change,
                Task.Fields.LIST,
                TaskList.Fields.ITEMS_COUNT,
                task => {
                    return task.list
                });

        // Move one done task to another list if list changed and task done state doesn't changed
        Functions.task()
            .updateCompletionCountWhenRelativeObjectChanged(
                change,
                Task.Fields.LIST,
                TaskList.Fields.DONE_ITEMS_COUNT,
                task => {
                    return task.list
                },
                taskCountInListUpdateBatch);

        // Update completed task count in related task list if needed
        Functions.task()
            .updateCompletionCountInRelativeObject(
                change,
                Task.Fields.LIST,
                TaskList.Fields.DONE_ITEMS_COUNT,
                taskCountInListUpdateBatch);

        // Update tasks count in related housing
        const taskCountInHouseUpdateBatch = Functions.task()
            .updateCountInRelativeObject(
                change,
                Task.Fields.OBJECT,
                Housing.Fields.TASKS_COUNT,
                task => {
                    return task.object
                });

        // Update completed tasks count in related housing if needed
        Functions.task()
            .updateCompletionCountInRelativeObject(
                change,
                Task.Fields.OBJECT,
                Housing.Fields.DONE_TASKS_COUNT,
                taskCountInHouseUpdateBatch);

        Functions.task()
            .updateCompletionCountWhenRelativeObjectChanged(
                change,
                Task.Fields.OBJECT,
                Housing.Fields.DONE_TASKS_COUNT,
                task => {
                    return task.list
                },
                taskCountInHouseUpdateBatch);

        return Promise.all([
            taskCountInListUpdateBatch.commit(),
            taskCountInHouseUpdateBatch.commit()
        ]).catch(res => {
            console.error(res.toLocaleString());
            return this.updateTaskCounters(change)
        })
    }

    updateInLocalCollection(change: Change<DocumentSnapshot>): Promise<any> {
        // Update task in local collection if needed
        return Functions.task().updateTaskInListCollection(change).commit()
    }

    updateNextIterationTime(change: Change<DocumentSnapshot>): Promise<any> {
        return Functions.task().updateTasksNextIterationDate(change.before, change.after).commit()
    }

    incrementTaskCounters(snapshot: DocumentSnapshot): Promise<any> {
        // Incrementing task counts in tasks list
        const taskListUpdateBatch = Functions.countable()
            .update(Task, snapshot, Task.Fields.LIST, TaskList.Fields.ITEMS_COUNT)
            .increment();

        // Increment completed task count in task list if needed
        Functions.countable().update(Task, snapshot, Task.Fields.LIST, TaskList.Fields.DONE_ITEMS_COUNT)
            .setBatch(taskListUpdateBatch)
            .setCondition(value => {
                return value.isDone === true
            })
            .increment();

        // Incrementing task counts in housing
        const housingUpdateBatch = Functions.countable()
            .update(Task, snapshot, Task.Fields.OBJECT, Housing.Fields.TASKS_COUNT)
            .increment();

        // Increment completed task count in housing if needed
        Functions.countable().update(Task, snapshot, Task.Fields.OBJECT, Housing.Fields.DONE_TASKS_COUNT)
            .setBatch(housingUpdateBatch)
            .setCondition(value => {
                return value.isDone === true
            })
            .increment();

        return Promise.all([
            taskListUpdateBatch.commit(),
            housingUpdateBatch.commit()
        ]).catch(res => {
            console.error(res);
            return this.incrementTaskCounters(snapshot)
        })
    }

    copyToLocalCollection(snapshot: DocumentSnapshot): Promise<any> {
        // Copy task to local collection
        return Functions.task().createTaskInListCollection(snapshot).commit();
    }

    decrementTaskCounters(snapshot: DocumentSnapshot): Promise<any> {
        // Decrement task count in task list
        const taskListUpdateBatch = Functions.countable()
            .update(Task, snapshot, Task.Fields.LIST, TaskList.Fields.ITEMS_COUNT)
            .decrement();

        // Decrement completed task count in task list if needed
        Functions.countable().update(Task, snapshot, Task.Fields.LIST, TaskList.Fields.DONE_ITEMS_COUNT)
            .setBatch(taskListUpdateBatch)
            .setCondition(value => {
                return value.isDone === true
            })
            .decrement();

        // Decrement task count in housing
        const housingUpdateBatch = Functions.countable()
            .update(Task, snapshot, Task.Fields.OBJECT, Housing.Fields.TASKS_COUNT)
            .decrement();

        // Decrement completed task count in housing if needed
        Functions.countable().update(Task, snapshot, Task.Fields.OBJECT, Housing.Fields.DONE_TASKS_COUNT)
            .setBatch(housingUpdateBatch)
            .setCondition(value => {
                return value.isDone === true
            })
            .decrement();

        return Promise.all([
            taskListUpdateBatch.commit(),
            housingUpdateBatch.commit()
        ]).catch(res => {
            console.error(res);
            return this.decrementTaskCounters(snapshot);
        })
    }

    removeFromLocalCollection(snapshot: DocumentSnapshot): Promise<any> {
        // Delete task from local collection
        return Functions.task().deleteTaskInListCollection(snapshot).commit();
    }

}
