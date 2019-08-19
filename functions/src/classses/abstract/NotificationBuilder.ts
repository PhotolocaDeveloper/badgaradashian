import {NotificationPlanned} from "../model/NotificationPlanned";

export abstract class NotificationBuilder {

    protected _notification: NotificationPlanned | null = null;

    createNotification() {
        this._notification = new NotificationPlanned();
    }

    get notification(): NotificationPlanned | null {
        return this._notification;
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
