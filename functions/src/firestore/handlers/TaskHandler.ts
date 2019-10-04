import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {deserialize} from "typescript-json-serializer";
import {CaseToDo} from "../../classses/model/CaseToDo";

export class TaskHandler {
    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.caseToDo().createOnToDoCaseNotification(snapshot),
            Functions.caseToDo().incrementTasksInListCount(snapshot),
            Functions.caseToDo().incrementTaskInHouseCount(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().deleteRelatedNotifications(snapshot),
            Functions.general().deleteRelatedPhotos(snapshot),
            Functions.caseToDo().decrementTasksInListCount(snapshot),
            Functions.caseToDo().decrementTaskInHouseCount(snapshot)
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const caseToDoBefore = deserialize(change.before, CaseToDo);
        const caseToDoAfter = deserialize(change.after, CaseToDo);

        const promises: Promise<any>[] = [
            Functions.caseToDo().updateTaskInHouseCount(change.before, change.after),
            Functions.caseToDo().updateTaskInListCount(change.before, change.after),
        ];

        if (caseToDoAfter.nextRepetitionDate !== caseToDoBefore.nextRepetitionDate) {
            promises.concat([
                Functions.general().deleteRelatedNotifications(change.before),
                Functions.caseToDo().createOnToDoCaseNotification(change.after)
            ]);
        }

        return Promise.all(promises)
    }

    onWrite(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.caseToDo().updateTaskInListCollection(change)
        ])
    }
}
