import {NotificationBuilder} from "../../abstract/NotificationBuilder";
import {NotificationClickAction} from "../../../enums/NotificationClickAction";
import {NotificationApnsCategory} from "../../../enums/NotificationApnsCategory";
import {AppEvent} from "../../../enums/AppEvent";
import * as admin from "firebase-admin";
import {Inventory} from "../../model/Inventory";
import {NotificationType} from "../../../enums/NotificationType";
import Firestore = admin.firestore;

export class InventoryEndsNotifBuilder extends NotificationBuilder {

    constructor(
        private recipientId: string,
        private relatedObject: Firestore.DocumentReference,
        private inventory: Inventory
    ) {
        super();
    }

    public titleTemplate = "Проверь инвентарь";
    public bodyTemplate = "Cрок службы инветнаря заканчивается {date_ends}";

    buildRecipient(): void {
        this.notification.recipient = this.recipientId;
    }

    buildType(): void {
        this.notification.type = NotificationType.Personal
    }

    buildAndroidClickAction(): void {
        this.notification.androidClickAction = NotificationClickAction.ShowInventory
    }

    buildApnsCategory(): void {
        this.notification.apnsCategory = NotificationApnsCategory.InventoryEnds
    }

    buildEvent(): void {
        this.notification.event = AppEvent.InventoryEnds
    }

    buildNotificationData(): void {
        this.notification.notificationData = {
            "inventory_id": this.relatedObject.id
        }
    }

    buildNotificationMessage(): void {
        const title = this.titleTemplate;
        const body = this.bodyTemplate;
        this.notification.notificationTitle = title;
        this.notification.notificationBody = body;
    }

    buildPlanedDateToDispatch(): void {
        const dateToDispatch = this.inventory.nextReplacementDate.toMillis() - 3600 * 1000;
        this.notification.plannedDateOfDispatch = Firestore.Timestamp.fromMillis(dateToDispatch);
    }

    buildRelatedObject(): void {
        this.notification.relatedObject = this.relatedObject
    }

    buildResendingPeriod(): void {
        this.notification.resendingPeriod = null
    }

}
