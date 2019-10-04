import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
// import {Change} from "firebase-functions";
import {Functions} from "../Functions";

export class TaskListHandlers {
    // onCreate(snapshot: DocumentSnapshot): Promise<any> {
    // }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.caseToDo().deleteToDoCasesInList(snapshot)
        ])
    }

    // onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
    // }
}
