import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";
import {deserialize} from "typescript-json-serializer";
import {Room} from "../../classses/model/Room";

export class RoomFunctions {

    /**
     * Удаляет все списки инвенторя в комнате
     * @param snapshot
     */
    deleteInventoryLists(snapshot: DocumentSnapshot) {
        return admin.firestore()
            .collection(FirestoreCollection.InventoryLists)
            .where("room", "==", snapshot.ref)
            .get()
            .then(Helper.firestore().deleteAllFilesInQuery)
    }

    /**
     * Увеличивает счетчик количества комнат в объекте на 1
     * @param snapshot
     */
    incrementRoomInHousingCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), Room);
        if (item.object === undefined) return Promise.resolve();
        return Helper.firestore().incrementField(item.object, "rooms_count")
    }

    /**
     * Увеличивает счетчик количества комнат в объекте на 1
     * @param snapshot
     */
    decrementRoomInHousingCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), Room);
        if (item.object === undefined) return Promise.resolve();
        return Helper.firestore().decrementField(item.object, "rooms_count")
    }

    /* Методы для изменения количества инветаря в связанных объектах */
    /**
     * Изменяет количество инвентаря в связанном объекте
     * @param before
     * @param after
     */
    updateInventoryInHousingCount(before: DocumentSnapshot, after: DocumentSnapshot): Promise<any> {
        return Promise.all([
            this.decrementInventoryInHousingCount(before),
            this.incrementInventoryInHousingCount(after)
        ])
    }

    /**
     * Увеличивает количество инвентаря в связанном объекте
     * @param snapshot
     */
    incrementInventoryInHousingCount(snapshot: DocumentSnapshot): Promise<any> {
        const item = deserialize(snapshot.data(), Room);
        if (item.object === undefined || item.inventoriesCount == undefined) return Promise.resolve();
        return Helper.firestore().incrementField(item.object, "inventories_count", item.inventoriesCount);
    }

    /**
     * Уменьшает количество инвентаря в связанном объекте
     * @param snapshot
     */
    decrementInventoryInHousingCount(snapshot: DocumentSnapshot): Promise<any> {
        const item = deserialize(snapshot.data(), Room);
        if (item.object === undefined || item.inventoriesCount == undefined) return Promise.resolve();
        return Helper.firestore().decrementField(item.object, "inventories_count", item.inventoriesCount);
    }

}
