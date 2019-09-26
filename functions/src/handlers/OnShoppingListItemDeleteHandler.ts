import {Functions} from "../firestore/Functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";

export function onShoppingListItemDeleteHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.general().deleteRelatedNotifications(snapshot),
        Functions.general().deleteRelatedPhotos(snapshot)
    ]);
}
