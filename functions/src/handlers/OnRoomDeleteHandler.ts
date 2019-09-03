import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";
import {EventContext} from "firebase-functions";

export function onRoomDeleteHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        Functions.general().deleteRelatedPhotos(snapshot, context),
        Functions.room().deleteInventoryLists(snapshot)
    ])
}
