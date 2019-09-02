import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {Functions} from "../firestore/Functions";

export function onInventoryDeleteHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        Functions.general().deleteRelatedNotifications(snapshot, context),
        Functions.general().deleteRelatedPhotos(snapshot, context),
        Functions.inventory().deleteRelatedShoppingListItems(snapshot, context)
    ]);
}
