import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";

export class HousingFunctions {

    /**
     * Удаляет все комнаты связанные с объектом
     * @param snapshot
     */
    deleteRooms(snapshot: DocumentSnapshot) {
        return admin.firestore()
            .collection(FirestoreCollection.Rooms)
            .where("object", "==", snapshot.ref.id)
            .get()
            .then(Helper.firestore().deleteAllFilesInQuery)
    }
}
