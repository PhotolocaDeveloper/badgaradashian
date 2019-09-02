import {GeneralFunctions} from "../firestore/GeneralFunctions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";

export function onCaseToDoDeleteHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        GeneralFunctions.deleteRelatedNotifications(snapshot, context),
        GeneralFunctions.deleteRelatedPhotos(snapshot, context)
    ]);
}
