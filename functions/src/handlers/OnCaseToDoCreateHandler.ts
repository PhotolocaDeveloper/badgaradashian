import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {Functions} from "../firestore/Functions";

export function onCaseToDoCreateHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        Functions.caseToDo().createOnToDoCaseNotification(snapshot, context)
    ])
}
