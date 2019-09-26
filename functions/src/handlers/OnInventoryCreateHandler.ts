import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onInventoryCreateHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.inventory().createOnInventoryEndsNotification(snapshot),
        Functions.inventory().createShoppingListItem(snapshot)
    ])
}
