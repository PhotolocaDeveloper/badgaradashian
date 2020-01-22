import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";
import {Room} from "../../classses/model/Room";
import {ILBBase} from "../../classses/builders/inventoryList/ILBBase";
import {InventoryListCreator} from "../../classses/creators/InventoryListCreator";

export class RoomFunctions {

    createBaseInventoryList(snapshot: DocumentSnapshot) {
        const item = Helper.firestore().deserialize(snapshot, Room);
        if (!item?.user || !item?.object) return Promise.reject("User or object unset");
        const inventoryListBuilder = new ILBBase(item.user, item.object, snapshot.ref);
        const inventoryListCreator = new InventoryListCreator(inventoryListBuilder);
        return inventoryListCreator.create().createBatch().commit()
    }

    /**
     * Удаляет все списки инвенторя в комнате
     * @param snapshot
     */
    deleteInventoryLists(snapshot: DocumentSnapshot) {
        const query = admin.firestore()
            .collection(FirestoreCollection.InventoryLists)
            .where("room", "==", snapshot.ref);
        return Helper.firestore().deleteAllFilesInQuery(query);
    }

}
