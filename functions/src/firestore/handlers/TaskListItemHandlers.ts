import {Change} from "firebase-functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";

export class TaskListItemHandlers {


    onWrite(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            // Update date_to_do in task list
            Functions.task().updateDateToDoInList(change.after),
            Functions.task().updateDateToDoInList(change.before)
        ]);
    }
}
