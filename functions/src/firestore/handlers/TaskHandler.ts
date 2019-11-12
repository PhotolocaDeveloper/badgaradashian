import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {deserialize} from "typescript-json-serializer";
import {Task} from "../../classses/model/Task";

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
        const caseToDoBefore = deserialize(change.before.data(), Task);
        const caseToDoAfter = deserialize(change.after.data(), Task);

        const promises: Promise<any>[] = [];

        // Update related notification if `nextRepetitionDate` was changed
        if (caseToDoAfter.nextRepetitionDate !== caseToDoBefore.nextRepetitionDate) {
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
        const taskCountInListUpdateBatch = Functions.task().updateTasksCountInTaskList(change.before, change.after);

        // Update completed task count in related task list if needed
        Functions.task().updateCompletionTasksCountInTaskList(change.before, change.after, taskCountInListUpdateBatch);

        // Update tasks count in related housing
        const taskCountInHouseUpdateBatch = Functions.task().updateTasksCountInHouse(change.before, change.after);

        // Update completed tasks count in related housing if needed
        Functions.task().updateCompletionTasksCountInHouse(change.before, change.after, taskCountInHouseUpdateBatch);

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
        const taskListUpdateBatch = Functions.task().incrementTotalInListCount(snapshot);

        // Increment completed task count in task list if needed
        Functions.task().incrementCompetedTasksCountInTaskList(snapshot, taskListUpdateBatch);

        // Incrementing task counts in housing
        const housingUpdateBatch = Functions.task().incrementTaskInHouseCount(snapshot);

        // Increment completed task count in housing if needed
        Functions.task().incrementCompetedTaskCountInHousing(snapshot, housingUpdateBatch);

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
        const taskListUpdateBatch = Functions.task().decrementTotalInListCount(snapshot);

        // Decrement completed task count in task list if needed
        Functions.task().decrementCompetedTasksCountInTaskList(snapshot, taskListUpdateBatch);

        // Decrement task count in housing
        const housingUpdateBatch = Functions.task().decrementTaskInHouseCount(snapshot);

        // Decrement completed task count in housing if needed
        Functions.task().decrementCompetedTaskCountInHousing(snapshot, housingUpdateBatch);

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
