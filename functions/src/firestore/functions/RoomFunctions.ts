import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";

export class RoomFunctions {

    /**
     * Удаляет все списки инвенторя в комнате
     * @param snapshot
     */
    deleteInventoryLists(snapshot: DocumentSnapshot) {
        return admin.firestore()
            .collection(FirestoreCollection.InventoryLists)
            .where("room", "==", snapshot.ref.id)
            .get()
            .then(Helper.firestore().deleteAllFilesInQuery)
    }

}
