import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {deserialize} from "typescript-json-serializer";
import {Task} from "../../classses/model/Task";
import * as admin from "firebase-admin";

export class TaskHandler {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        const batch = admin.firestore().batch();

        Functions.task().createTaskInListCollection(snapshot, batch);
        Functions.task().incrementTaskInHouseCount(snapshot, batch);

        return Promise.all([
            Functions.task().createOnToDoCaseNotification(snapshot),
            Functions.task().createCalendarEvent(snapshot),
            batch.commit()
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        const batch = admin.firestore().batch();

        Functions.task().deleteTaskInListCollection(snapshot, batch);
        Functions.task().decrementTaskInHouseCount(snapshot, batch);

        return Promise.all([
            Functions.general().deleteRelatedNotifications(snapshot),
            Functions.general().deleteRelatedPhotos(snapshot),
            Functions.task().deleteCalendarEvents(snapshot),
            batch.commit()
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const caseToDoBefore = deserialize(change.before.data(), Task);
        const caseToDoAfter = deserialize(change.after.data(), Task);

        const batch = admin.firestore().batch();

        const promises: Promise<any>[] = [];

        Functions.task().updateTaskInHouseCount(change.before, change.after, batch);
        Functions.task().updateTaskInListCollection(change, batch);

        if (caseToDoAfter.nextRepetitionDate !== caseToDoBefore.nextRepetitionDate) {
            promises.concat([
                Functions.general().deleteRelatedNotifications(change.before),
                Functions.task().createOnToDoCaseNotification(change.after)
            ]);
        }

        promises.concat([
            Functions.task().updateCalendarEvents(change.after),
            batch.commit()
        ]);

        return Promise.all(promises)
    }

    onCheckerUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        return Functions.task().updateChecker(change).commit();
    }

    onCheckerDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Functions.task().deleteChecker(snapshot).commit();
    }
}
