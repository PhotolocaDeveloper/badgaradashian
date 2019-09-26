import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onShoppingListDeleteHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.shopping().deleteAllShoppingListItemFromList(snapshot)
    ])
}
