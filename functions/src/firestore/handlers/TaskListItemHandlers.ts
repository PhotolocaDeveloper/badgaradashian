import {Change} from "firebase-functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";
import * as admin from "firebase-admin";

export class TaskListItemHandlers {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        const batch = admin.firestore().batch();

        Functions.task().incrementTotalInListCount(snapshot, batch);
        Functions.task().incrementCompetedInListCount(snapshot, batch);

        return batch.commit()
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        const batch = admin.firestore().batch();

        Functions.task().decrementTotalInListCount(snapshot, batch);
        Functions.task().decrementCompetedInListCount(snapshot, batch);

        return batch.commit();
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.task().updateCompletedTaskInListCount(change)
        ])
    }

    onWrite(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.task().updateDateToDoInList(change.after),
            Functions.task().updateDateToDoInList(change.before)
        ]);
    }
}
