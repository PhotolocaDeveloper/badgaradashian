import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {InventoryFunctions} from "../firestore/InventoryFunctions";
import {GeneralFunctions} from "../firestore/GeneralFunctions";

export function onInventoryDeleteHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        GeneralFunctions.deleteRelatedNotifications(snapshot, context),
        GeneralFunctions.deleteRelatedPhotos(snapshot, context),
        InventoryFunctions.deleteRelatedShoppingListItems(snapshot, context)
    ]);
}
