import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onCaseToDoDeleteHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.general().deleteRelatedNotifications(snapshot),
        Functions.general().deleteRelatedPhotos(snapshot)
    ]);
}
