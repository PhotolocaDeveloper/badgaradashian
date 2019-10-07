import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {deserialize} from "typescript-json-serializer";
import {CaseToDo} from "../../classses/model/CaseToDo";
import * as admin from "firebase-admin";

export class TaskHandler {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        const batch = admin.firestore().batch();

        Functions.caseToDo().createTaskInListCollection(snapshot, batch);
        Functions.caseToDo().incrementTaskInHouseCount(snapshot, batch);

        return Promise.all([
            Functions.caseToDo().createOnToDoCaseNotification(snapshot),
            batch.commit()
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        const batch = admin.firestore().batch();

        Functions.caseToDo().deleteTaskInListCollection(snapshot, batch);
        Functions.caseToDo().decrementTaskInHouseCount(snapshot, batch);

        return Promise.all([
            Functions.general().deleteRelatedNotifications(snapshot),
            Functions.general().deleteRelatedPhotos(snapshot),
            batch.commit()
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const caseToDoBefore = deserialize(change.before, CaseToDo);
        const caseToDoAfter = deserialize(change.after, CaseToDo);

        const batch = admin.firestore().batch();

        const promises: Promise<any>[] = [];

        Functions.caseToDo().updateTaskInHouseCount(change.before, change.after, batch);
        Functions.caseToDo().updateTaskInListCollection(change, batch);

        if (caseToDoAfter.nextRepetitionDate !== caseToDoBefore.nextRepetitionDate) {
            promises.concat([
                Functions.general().deleteRelatedNotifications(change.before),
                Functions.caseToDo().createOnToDoCaseNotification(change.after)
            ]);
        }

        promises.concat([
            batch.commit()
        ]);

        return Promise.all(promises)
    }
}
