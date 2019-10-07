import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize, serialize} from "typescript-json-serializer";
import {NotificationCreator} from "../../classses/creators/NotificationCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {ShoppingListItem} from "../../classses/model/ShoppingListItem";
import {NBNeedToBuyObject} from "../../classses/builders/notifications/NBNeedToBuyObject";
import {Helper} from "../../classses/helpers/Helper";

export class ShoppingFunctions {

    /**
     * Изменяет количество элементов списка покупок в связанных списках
     * @param before
     * @param after
     */
    updateShoppingListItemInListCount(before: DocumentSnapshot, after: DocumentSnapshot) {
        const itemBefore = deserialize(before.data(), ShoppingListItem);
        const itemAfter = deserialize(after.data(), ShoppingListItem);
        if (itemBefore.list!.path === itemAfter.list!.path) return Promise.resolve();
        return Promise.all([
            this.decrementShoppingItemsInListCount(before),
            this.incrementShoppingItemsInListCount(after)
        ])
    }

    /**
     * Увеличивает счетчик количества покупок в списке на 1
     * @param snapshot
     */
    incrementShoppingItemsInListCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), ShoppingListItem);
        if (item.list === undefined) return Promise.resolve();
        return Helper.firestore().incrementField(item.list, "items_count")
    }

    /**
     * Уменьшает счетчик количества покупок в списке на 1
     * @param snapshot
     */
    decrementShoppingItemsInListCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), ShoppingListItem);
        if (item.list === undefined) return Promise.resolve();
        return Helper.firestore().decrementField(item.list, "items_count")
    }

    /**
     * Удаляет все связанные со списком покупок покупки
     * @param snapshot
     */
    deleteAllShoppingListItemFromList(snapshot: DocumentSnapshot): Promise<any> {
        return admin.firestore()
            .collection(FirestoreCollection.Buys)
            .where("list", "==", snapshot.ref)
            .get()
            .then(Helper.firestore().deleteAllFilesInQuery)
    }

    /***
     * Добавляет уведомление о необходисости покупки товара
     * @param snapshot
     */
    createOnShoppingListItemNeedToBuy(snapshot: DocumentSnapshot): Promise<any> {
        const shoppingListItem = deserialize(snapshot.data(), ShoppingListItem);
        const uid = shoppingListItem.user.id;

        if (shoppingListItem.dateToBuy === undefined) {
            return Promise.resolve();
        }

        const notificationBuilder = new NBNeedToBuyObject(uid, snapshot.ref, shoppingListItem);
        const notificationCreator = new NotificationCreator(notificationBuilder);

        const notification = notificationCreator.construct().get();

        return admin.firestore().collection(FirestoreCollection.Notifications).doc().create(serialize(notification));
    }
}
