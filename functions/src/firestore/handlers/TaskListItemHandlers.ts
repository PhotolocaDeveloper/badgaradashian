import {Change} from "firebase-functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";

export class TaskListItemHandlers {
    onWrite(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.caseToDo().updateDateToDoInList(change.before),
            Functions.caseToDo().updateDateToDoInList(change.after)
        ])
    }
}
