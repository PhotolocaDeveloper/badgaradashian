import {NotificationBuilder} from "../../abstract/NotificationBuilder";
import {ShoppingListItem} from "../../model/ShoppingListItem";
import * as admin from "firebase-admin";
import {NotificationClickAction} from "../../../enums/NotificationClickAction";
import {NotificationApnsCategory} from "../../../enums/NotificationApnsCategory";
import {AppEvent} from "../../../enums/AppEvent";
import {NotificationType} from "../../../enums/NotificationType";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

export class NBNeedToBuyObject extends NotificationBuilder {

    constructor(
        private recipientId: string,
        private relatedObject: DocumentReference,
        private shoppingListItem: ShoppingListItem
    ) {
        super();
    }

    buildAndroidClickAction(): void {
        this.notification.androidClickAction = NotificationClickAction.ShowShoppingListItem
    }

    buildApnsCategory(): void {
        this.notification.apnsCategory = NotificationApnsCategory.ShoppingListItemNeedToBuy
    }

    buildEvent(): void {
        this.notification.event = AppEvent.NeedToBuyObject
    }

    buildNotificationData(): void {
        this.notification.notificationData = {
            "shopping_list_item_id": this.relatedObject.id
        }
    }

    buildNotificationMessage(): void {
        if (this.shoppingListItem.dateToBuy === undefined) return;
        const title = `Запланирована покупка "${this.shoppingListItem.name}"`;
        const body = `Необходимо купить "${this.shoppingListItem.name} до ${this.shoppingListItem.dateToBuy.toDate().toDateString()}"`;
        this.notification.notificationTitle = title;
        this.notification.notificationBody = body;
    }

    buildPlanedDateToDispatch(): void {
        if (this.shoppingListItem.dateToBuy === undefined) return;
        const dateToDispatch = this.shoppingListItem.dateToBuy.toMillis() - 24 * 3600 * 1000;
        this.notification.plannedDateOfDispatch = Timestamp.fromMillis(dateToDispatch);
    }

    buildRecipient(): void {
        this.notification.recipient = this.recipientId
    }

    buildRelatedObject(): void {
        this.notification.relatedObject = this.relatedObject
    }

    buildResendingPeriod(): void {
        this.notification.resendingPeriod = null
    }

    buildType(): void {
        this.notification.type = NotificationType.Personal
    }

}
