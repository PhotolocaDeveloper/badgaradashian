import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onInventoryListDeleteHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.inventory().deleteInventoryListItems(snapshot)
    ])
}
