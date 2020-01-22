import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Helper} from "../../classses/helpers/Helper";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";

export class InventoryListFunctions {
    /**
     * Удаляет весь инвентарь связанный со списком
     * @param snapshot
     */
    deleteInventoryListItems(snapshot: DocumentSnapshot) {
        const query = admin.firestore()
            .collection(FirestoreCollection.Inventories)
            .where("inventory_list", "==", snapshot.ref);
        return Helper.firestore().deleteAllFilesInQuery(query)
    }
}
