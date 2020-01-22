import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {serialize} from "typescript-json-serializer";
import {NotificationCreator} from "../../classses/creators/NotificationCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {ShoppingListItem} from "../../classses/model/ShoppingListItem";
import {NBNeedToBuyObject} from "../../classses/builders/notifications/NBNeedToBuyObject";
import {Helper} from "../../classses/helpers/Helper";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {UpdateMethod} from "./CountableFunctions";
import WriteBatch = admin.firestore.WriteBatch;
import DocumentReference = admin.firestore.DocumentReference;

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
        const shoppingListItem = Helper.firestore().deserialize(snapshot, ShoppingListItem);

        if (shoppingListItem === undefined) {
            return Promise.reject("Can't deserialize 'ShoppingListItem'")
        }

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
     * Update count of completed tasks in relative object when task's state changed
     * is_done = (true -> false) or (false -> true)
     * @param change
     * @param refField
     * @param counterField
     * @param batch
     */
    updateCompletionCountInRelativeObject(
        change: Change<DocumentSnapshot>,
        refField: string,
        counterField: string,
        batch: WriteBatch = admin.firestore().batch()
    ): WriteBatch {
        return Functions.countable()
            .multiplyUpdate(ShoppingListItem, refField, counterField)
            .setSnapshots([change.before, change.after])
            .setBatch(batch)
            .setConditions(values => {
                const beforeDone = values[0].isDone || false;
                const afterDone = values[1].isDone || false;
                const isChecked = !beforeDone && afterDone;
                const isUnChecked = !afterDone && beforeDone;
                if (isChecked) return [UpdateMethod.None, UpdateMethod.Increment];
                if (isUnChecked) return [UpdateMethod.Decrement, UpdateMethod.None];
                return null
            })
            .update();
    }

    /**
     * Update count of completed tasks in relative object if it was change and
     * task was mark as completed
     * @param change
     * @param refField
     * @param counterField
     * @param reference
     * @param batch
     */
    updateCompletionCountWhenRelativeObjectChanged(
        change: Change<DocumentSnapshot>,
        refField: string,
        counterField: string,
        reference: (task: ShoppingListItem) => DocumentReference | undefined,
        batch: WriteBatch = admin.firestore().batch()
    ): WriteBatch {
        return Functions.countable()
            .move(ShoppingListItem, change.before, change.after, refField, counterField)
            .setBatch(batch)
            .setCondition((valueFrom, valueTo) => {
                const relativeObjectFrom = reference(valueFrom);
                const relativeObjectTo = reference(valueTo);
                return valueFrom.isDone === true && valueTo.isDone === true
                    && !(relativeObjectFrom !== relativeObjectTo
                        && relativeObjectFrom !== undefined
                        && relativeObjectTo !== undefined
                        && relativeObjectFrom.path === relativeObjectTo.path)
            })
            .move();
    }

    /**
     * Decrement count of tasks in related object before
     * and increment tasks count in related object  after
     * if its was change
     * @param change
     * @param refField
     * @param counterField
     * @param reference
     * @param batch
     */
    updateCountInRelativeObject(
        change: Change<DocumentSnapshot>,
        refField: string,
        counterField: string,
        reference: (task: ShoppingListItem) => DocumentReference | undefined,
        batch: WriteBatch = admin.firestore().batch()
    ): WriteBatch {
        return Functions.countable()
            .move(ShoppingListItem, change.before, change.after, refField, counterField)
            .setBatch(batch)
            .setCondition((valueFrom, valueTo) => {
                const relativeObjectFrom = reference(valueFrom);
                const relativeObjectTo = reference(valueTo);
                return !(relativeObjectFrom !== relativeObjectTo
                    && relativeObjectFrom !== undefined
                    && relativeObjectTo !== undefined
                    && relativeObjectFrom.path === relativeObjectTo.path)
            })
            .move();
    }
}
