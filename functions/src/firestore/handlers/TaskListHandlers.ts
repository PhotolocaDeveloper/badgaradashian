import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";

export class TaskListHandlers {
    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.taskList().deleteSubTasks(snapshot)
        ])
    }
}
