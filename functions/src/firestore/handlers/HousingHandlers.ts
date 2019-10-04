import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";

export class HousingHandlers {
    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().deleteRelatedPhotos(snapshot),
            Functions.housing().deleteRooms(snapshot)
        ])
    }
}
