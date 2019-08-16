import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

import Firestore = admin.firestore;
import {NotificationMessage} from "./NotificationMessage";
import {NotificationType} from "../../enums/NotificationType";
import {AppEvent} from "../../enums/AppEvent";
import {NotificationPlanned} from "./NotificationPlanned";

@Serializable('NotificationPlanned')
export class NotificationPersonal extends NotificationPlanned {
    constructor(
        @JsonProperty() public event: AppEvent,
        @JsonProperty('recipient_id') public recipientId: string,
        relatedObject: Firestore.DocumentReference,
        notification: NotificationMessage,
        notificationData: Map<string, any>,
        androidClickAction: string,
        apnsCategory: string,
        plannedDateOfDispatch: Firestore.Timestamp,
        resendingPeriod: number
    ) {
        super(
            NotificationType.Personal,
            relatedObject,
            notification,
            notificationData,
            androidClickAction,
            apnsCategory,
            plannedDateOfDispatch,
            resendingPeriod);
    }
}
