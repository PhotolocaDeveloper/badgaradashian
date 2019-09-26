import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onShoppingListItemCreateHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.shopping().createOnShoppingListItemNeedToBuy(snapshot)
    ])
}
