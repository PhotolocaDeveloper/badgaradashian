import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onCaseToDoCreateHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.caseToDo().createOnToDoCaseNotification(snapshot)
    ])
}
