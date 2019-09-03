import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onRoomDeleteHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.room().deleteInventoryLists(snapshot)
    ])
}
