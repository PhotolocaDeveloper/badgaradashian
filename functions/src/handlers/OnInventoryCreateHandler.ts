import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {Functions} from "../firestore/Functions";

export function onInventoryCreateHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        Functions.inventory().createOnInventoryEndsNotification(snapshot, context),
        Functions.inventory().createShoppingListItem(snapshot, context)
    ])
}
