import {Functions} from "../firestore/Functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";

export function onShoppingListItemDeleteHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        Functions.general().deleteRelatedNotifications(snapshot, context),
        Functions.general().deleteRelatedPhotos(snapshot, context)
    ]);
}
