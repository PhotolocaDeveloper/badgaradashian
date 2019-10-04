import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize} from "typescript-json-serializer";
import {InventoryList} from "../../classses/model/InventoryList";
import {Helper} from "../../classses/helpers/Helper";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";

export class InventoryListFunctions {

    /**
     * Изменение количества инвентаря в связанных комнатах
     */

    /**
     * Обновляет количество инвентаря в связанных комнатах
     * @param before
     * @param after
     */
    updateInventoryInRoomCount(before: DocumentSnapshot, after: DocumentSnapshot): Promise<any> {
        return Promise.all([
            this.decrementInventoryInRoomCount(before),
            this.incrementInventoryInRoomCount(after)
        ])
    }

    /**
     * Увеличивает счетчик количества инвентаря в связанной комнате комнате на количество инвентаря в списке
     * @param snapshot
     */
    incrementInventoryInRoomCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), InventoryList);
        if (item.room === undefined || item.inventoriesCount === undefined || item.inventoriesCount === 0) return Promise.resolve();
        return Helper.firestore().incrementField(item.room, "inventories_count", item.inventoriesCount)
    }

    /**
     * Уменьшает счетчик количества инвентаря в связанной комнате комнате на количество инвентаря в списке
     * @param snapshot
     */
    decrementInventoryInRoomCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), InventoryList);
        if (item.room === undefined || item.inventoriesCount === undefined || item.inventoriesCount === 0) return Promise.resolve();
        return Helper.firestore().decrementField(item.room, "inventories_count", item.inventoriesCount)
    }

    /** Изменение количиства списков инвентаря в связанных комнатах **/

    /**
     * Изменяет количество списков инвентаря в связанных комнатах
     * @param before
     * @param after
     */
    updateInventoryListInRoomCount(before: DocumentSnapshot, after: DocumentSnapshot): Promise<any> {
        const itemBefore = deserialize(before.data(), InventoryList);
        const itemAfter = deserialize(after.data(), InventoryList);
        if (itemBefore.room === itemAfter.room) return Promise.resolve();
        return Promise.all([
            this.decrementInventoryListsInRoomCount(before),
            this.incrementInventoryListsInRoomCount(after)
        ])
    }

    /**
     * Увеличивает счетчик количества списков инвентаря в комнате на 1
     * @param snapshot
     */
    incrementInventoryListsInRoomCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), InventoryList);
        if (item.room === undefined) return Promise.resolve();
        return Helper.firestore().incrementField(item.room, "inventory_lists_count")
    }

    /**
     * Увеличивает счетчик количества списков инвентаря в комнате на 1
     * @param snapshot
     */
    decrementInventoryListsInRoomCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), InventoryList);
        if (item.room === undefined) return Promise.resolve();
        return Helper.firestore().decrementField(item.room, "inventory_lists_count")
    }

    /** Изменение количиства списков инвентаря в связанных объектах **/

    /**
     * Изменяет количество списков инвентаря в связанных комнатах
     * @param before
     * @param after
     */
    updateInventoryListInHousingCount(before: DocumentSnapshot, after: DocumentSnapshot) {
        const itemBefore = deserialize(before.data(), InventoryList);
        const itemAfter = deserialize(after.data(), InventoryList);
        if (itemBefore.housing === itemAfter.housing) return Promise.resolve();
        return Promise.all([
            this.decrementInventoryListsInHousingCount(before),
            this.incrementInventoryListsInHousingCount(after)
        ])
    }

    /**
     * Уменьшает счетчик количества списков инвентаря в объекте на 1
     * @param snapshot
     */
    decrementInventoryListsInHousingCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), InventoryList);
        if (item.housing === undefined) return Promise.resolve();
        return Helper.firestore().decrementField(item.housing, "inventory_lists_count")
    }

    /**
     * Увеличивает счетчик количества списков инвентаря в объекте на 1
     * @param snapshot
     */
    incrementInventoryListsInHousingCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), InventoryList);
        if (item.housing === undefined) return Promise.resolve();
        return Helper.firestore().incrementField(item.housing, "inventory_lists_count")
    }

    /**
     * Удаляет весь инвентарь связанный со списком
     * @param snapshot
     */
    deleteInventoryListItems(snapshot: DocumentSnapshot) {
        return admin.firestore()
            .collection(FirestoreCollection.Inventories)
            .where("inventory_list", "==", snapshot.ref)
            .get()
            .then(Helper.firestore().deleteAllFilesInQuery)
    }
}
