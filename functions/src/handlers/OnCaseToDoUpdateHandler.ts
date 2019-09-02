import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change, EventContext} from "firebase-functions";
import {deserialize} from "typescript-json-serializer";
import {CaseToDo} from "../classses/model/CaseToDo";
import {Functions} from "../firestore/Functions";

export function onCaseToDoUpdateHandler(change: Change<DocumentSnapshot>, context: EventContext): Promise<any> | undefined {
    const caseToDoBefore = deserialize(change.before, CaseToDo);
    const caseToDoAfter = deserialize(change.after, CaseToDo);

    if (caseToDoAfter.nextRepetitionDate !== caseToDoBefore.nextRepetitionDate) {
        return Promise.all([
            Functions.general().deleteRelatedNotifications(change.before, context),
            Functions.caseToDo().createOnToDoCaseNotification(change.after, context)
        ])
    }

    return undefined
}
