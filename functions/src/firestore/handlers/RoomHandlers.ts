import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";
import {Change} from "firebase-functions";

export class RoomHandlers {
    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.room().incrementRoomInHousingCount(snapshot),
            Functions.room().createBaseInventoryList(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().deleteRelatedPhotos(snapshot),
            Functions.room().deleteInventoryLists(snapshot),
            Functions.room().decrementRoomInHousingCount(snapshot)
        ])
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.room().updateInventoryInHousingCount(change.before, change.after)
        ])
    }
}
