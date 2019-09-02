import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {CaseToDoFunctions} from "../firestore/CaseToDoFunctions";

export function onCaseToDoCreateHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        CaseToDoFunctions.createOnToDoCaseNotification(snapshot, context)
    ])
}
