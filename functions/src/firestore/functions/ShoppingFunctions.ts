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

    async updateMaxDateToDo(snapshot: DocumentSnapshot): Promise<any> {

        const parentCollectionReference = snapshot.ref.parent;
        const targetDocumentReference = snapshot.ref.parent.parent;

        if (!parentCollectionReference || !targetDocumentReference) return Promise.resolve();

        const querySnapshot = await parentCollectionReference.orderBy("date_to_buy", "desc").limit(1).get();
        const firstSnapshot = querySnapshot.docs.pop();

        if (!firstSnapshot) return Promise.resolve();

        const firstItem = Helper.firestore().snapshotToObject(firstSnapshot, ShoppingListItem);

        if (!firstItem || !firstItem.dateToBuy) return Promise.resolve();

        return targetDocumentReference.update("max_date_to_buy", firstItem.dateToBuy);
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

    /**
     * Увеличивает счётчик готовых задач в списке дел
     * @param snapshot
     * @param _batch
     */
    incrementCompetedInListCount(snapshot: DocumentSnapshot, _batch?: admin.firestore.WriteBatch) {
        const batch = _batch || admin.firestore().batch();
        const listRef = snapshot.ref.parent.parent;
        const taskItem = deserialize(snapshot.data(), ShoppingListItem);
        if (!listRef || !taskItem.isDone) return batch;
        return Helper.firestore().incrementFieldWithBatch(batch, listRef, "done_item_count")
    }

    /**
     * Уменьшает колчиество готовых зада в списке дел при удалении
     * @param snapshot
     * @param _batch
     */
    decrementCompetedInListCount(snapshot: DocumentSnapshot, _batch?: admin.firestore.WriteBatch) {
        const batch = _batch || admin.firestore().batch();
        const listRef = snapshot.ref.parent.parent;
        const taskItem = deserialize(snapshot.data(), ShoppingListItem);
        if (!listRef || !taskItem.isDone) return batch;
        return Helper.firestore().decrementFieldWithBatch(batch, listRef, "done_item_count")
    }

    /**
     *
     * @param change
     * @param _batch
     */
    updateCompletedTaskInListCount(change: Change<DocumentSnapshot>, _batch?: admin.firestore.WriteBatch) {
        const batch = _batch || admin.firestore().batch();
        const itemBefore = deserialize(change.before.data(), ShoppingListItem);
        const itemAfter = deserialize(change.after.data(), ShoppingListItem);
        const listRef = change.after.ref.parent.parent;
        if (!listRef) return batch;
        let inc = 0;
        if (itemBefore.isDone && !itemAfter.isDone) inc = -1;
        if (!itemBefore.isDone && itemAfter.isDone) inc = 1;
        return Helper.firestore().incrementFieldWithBatch(batch, listRef, "done_item_count", inc)
    }
}
