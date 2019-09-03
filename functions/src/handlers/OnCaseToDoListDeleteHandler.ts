import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onCaseToDoListDeleteHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.caseToDo().deleteToDoCasesInList(snapshot)
    ])
}
