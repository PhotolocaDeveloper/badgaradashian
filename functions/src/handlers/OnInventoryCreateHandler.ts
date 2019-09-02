import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {InventoryFunctions} from "../firestore/InventoryFunctions";

export function onInventoryCreateHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        InventoryFunctions.createOnInventoryEndsNotification(snapshot, context),
        InventoryFunctions.createShoppingListItem(snapshot, context)
    ])
}
