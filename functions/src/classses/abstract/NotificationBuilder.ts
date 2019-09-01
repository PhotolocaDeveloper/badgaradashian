import {NotificationPlanned} from "../model/NotificationPlanned";

export abstract class NotificationBuilder {

    notification!: NotificationPlanned;

    createNotification() {
        this.notification = new NotificationPlanned();
    }

    abstract buildType(): void;
    abstract buildRecipient(): void;
    abstract buildEvent(): void;
    abstract buildNotificationMessage(): void;
    abstract buildRelatedObject(): void;
    abstract buildNotificationData(): void;
    abstract buildAndroidClickAction(): void;
    abstract buildApnsCategory(): void;
    abstract buildPlanedDateToDispatch(): void;
    abstract buildResendingPeriod(): void;
}
