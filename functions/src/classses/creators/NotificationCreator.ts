import {NotificationBuilder} from "../abstract/NotificationBuilder";
import {NotificationPlanned} from "../model/NotificationPlanned"

export class NotificationCreator {

    constructor(
        private notificationBuilder: NotificationBuilder
    ) {}

    public get(): NotificationPlanned | null {
        return this.notificationBuilder.notification;
    }

    /**
     * Создаёт объект NotificationPlanned
     */
    public construct(): NotificationCreator {
        this.notificationBuilder.createNotification();
        this.notificationBuilder.buildAndroidClickAction();
        this.notificationBuilder.buildApnsCategory();
        this.notificationBuilder.buildEvent();
        this.notificationBuilder.buildNotificationData();
        this.notificationBuilder.buildNotificationMessage();
        this.notificationBuilder.buildPlanedDateToDispatch();
        this.notificationBuilder.buildRecipient();
        this.notificationBuilder.buildRelatedObject();
        this.notificationBuilder.buildResendingPeriod();
        this.notificationBuilder.buildType();
        return this;
    }
}
