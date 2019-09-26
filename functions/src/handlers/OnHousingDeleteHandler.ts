import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../firestore/Functions";

export function onHousingDeleteHandler(snapshot: DocumentSnapshot) {
    return Promise.all([
        Functions.general().deleteRelatedPhotos(snapshot),
        Functions.housing().deleteRooms(snapshot)
    ])
}
