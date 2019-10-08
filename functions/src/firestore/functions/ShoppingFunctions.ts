import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize, serialize} from "typescript-json-serializer";
import {NotificationCreator} from "../../classses/creators/NotificationCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {ShoppingListItem} from "../../classses/model/ShoppingListItem";
import {NBNeedToBuyObject} from "../../classses/builders/notifications/NBNeedToBuyObject";
import {Helper} from "../../classses/helpers/Helper";
import {Change} from "firebase-functions";

export class ShoppingFunctions {

    private static shoppingListDocumentReference(snapshot: DocumentSnapshot): admin.firestore.DocumentReference | undefined {
        const item = Helper.firestore().snapshotToObject(snapshot, ShoppingListItem);
        if (item === undefined || item.list === undefined) return undefined;
        return item.list.collection("items").doc(snapshot.id);
    }

    copyToShoppingList(snapshot: DocumentSnapshot, _batch?: admin.firestore.WriteBatch): admin.firestore.WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const documentReference = ShoppingFunctions.shoppingListDocumentReference(snapshot);
        if (documentReference !== undefined)
            batch.set(documentReference, snapshot.data()!);
        return batch;
    }

    removeFormShoppingList(snapshot: DocumentSnapshot, _batch?: admin.firestore.WriteBatch): admin.firestore.WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const documentReference = ShoppingFunctions.shoppingListDocumentReference(snapshot);

        if (documentReference !== undefined)
            batch.delete(documentReference);

        return batch;
    }

    updateAtShoppingList(change: Change<DocumentSnapshot>, _batch?: admin.firestore.WriteBatch): admin.firestore.WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const itemInListRefBefore = ShoppingFunctions.shoppingListDocumentReference(change.before);
        const itemInListRefAfter = ShoppingFunctions.shoppingListDocumentReference(change.after);

        if (itemInListRefBefore !== undefined && itemInListRefBefore !== itemInListRefAfter)
            batch.delete(itemInListRefBefore);

        if (itemInListRefAfter !== undefined)
            batch.set(itemInListRefAfter, change.after.data()!);

        return batch
    }

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
        const query = admin.firestore()
            .collection(FirestoreCollection.Buys)
            .where("list", "==", snapshot.ref);
        return Helper.firestore().deleteAllFilesInQuery(query);
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
