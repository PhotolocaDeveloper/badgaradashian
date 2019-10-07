import {Change} from "firebase-functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";
import * as admin from "firebase-admin";

export class TaskListItemHandlers {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        const batch = admin.firestore().batch();

        Functions.caseToDo().incrementTotalInListCount(snapshot, batch);
        Functions.caseToDo().incrementCompetedInListCount(snapshot, batch);

        return batch.commit()
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        const batch = admin.firestore().batch();

        Functions.caseToDo().decrementTotalInListCount(snapshot, batch);
        Functions.caseToDo().decrementCompetedInListCount(snapshot, batch);

        return batch.commit();
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.caseToDo().updateCompletedTaskInListCount(change)
        ])
    }

    onWrite(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.caseToDo().updateDateToDoInList(change.after),
            Functions.caseToDo().updateDateToDoInList(change.before)
        ]);
    }
}
