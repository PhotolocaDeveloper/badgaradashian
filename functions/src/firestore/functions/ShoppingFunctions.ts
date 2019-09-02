import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {deserialize, serialize} from "typescript-json-serializer";
import {NotificationCreator} from "../../classses/creators/NotificationCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {ShoppingListItem} from "../../classses/model/ShoppingListItem";
import {NBNeedToBuyObject} from "../../classses/builders/notifications/NBNeedToBuyObject";

export class ShoppingFunctions {

    /***
     * Добавляет уведомление о необходисости покупки товара
     * @param snapshot
     * @param context
     */
    createOnShoppingListItemNeedToBuy(snapshot: DocumentSnapshot, context: EventContext): Promise<any> | undefined {
        if (context.auth === undefined) return undefined;

        const shoppingListItem = deserialize(snapshot.data(), ShoppingListItem);
        const uid = context.auth.uid;

        if (shoppingListItem.dateToBuy === undefined) {
            return undefined;
        }

        const notificationBuilder = new NBNeedToBuyObject(uid, snapshot.ref, shoppingListItem);
        const notificationCreator = new NotificationCreator(notificationBuilder);

        const notification = notificationCreator.construct().get();

        return admin.firestore().collection(FirestoreCollection.Notifications).doc().create(serialize(notification));
    }
}
