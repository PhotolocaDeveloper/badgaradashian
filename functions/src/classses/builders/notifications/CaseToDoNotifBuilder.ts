import {NotificationBuilder} from "../../abstract/NotificationBuilder";
import {CaseToDo} from "../../model/CaseToDo";
import * as admin from "firebase-admin";
import {NotificationClickAction} from "../../../enums/NotificationClickAction";
import {NotificationApnsCategory} from "../../../enums/NotificationApnsCategory";
import {AppEvent} from "../../../enums/AppEvent";
import {NotificationType} from "../../../enums/NotificationType";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

export class CaseToDoNotifBuilder extends NotificationBuilder {

    constructor(
        private recipientId: string,
        private relatedObject: DocumentReference,
        private caseToDo: CaseToDo
    ) {
        super()
    }

    buildAndroidClickAction(): void {
        this.notification.androidClickAction = NotificationClickAction.ShowCaseToDo
    }

    buildApnsCategory(): void {
        this.notification.apnsCategory = NotificationApnsCategory.CaseNeedToDo
    }

    buildEvent(): void {
        this.notification.event = AppEvent.NeedToCompleteTask
    }

    buildNotificationData(): void {
        this.notification.notificationData = {
            "case_to_do_id": this.relatedObject.id
        }
    }

    buildNotificationMessage(): void {
        const title = "Истекает срок выполнения задачи";
        const body = `Чрез сутки истечет время на выполнение "${this.caseToDo.name}"`;
        this.notification.notificationTitle = title;
        this.notification.notificationBody = body;
    }

    buildPlanedDateToDispatch(): void {
        if (this.caseToDo.nextRepetitionDate === undefined) return;
        const dateToDispatch = this.caseToDo.nextRepetitionDate.toMillis() - 24 * 3600 * 1000;
        this.notification.plannedDateOfDispatch = Timestamp.fromMillis(dateToDispatch);
    }

    buildRecipient(): void {
        this.notification.recipient = this.recipientId;
    }

    buildRelatedObject(): void {
        this.notification.relatedObject = this.relatedObject
    }

    buildResendingPeriod(): void {
        this.notification.resendingPeriod = undefined
    }

    buildType(): void {
        this.notification.type = NotificationType.Personal
    }

}
