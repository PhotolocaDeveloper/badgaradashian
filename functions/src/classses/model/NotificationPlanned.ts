import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

import Firestore = admin.firestore;
import {NotificationMessage} from "./NotificationMessage";

@Serializable()
export class NotificationPlanned {
    constructor(
        @JsonProperty() public type: string,
        @JsonProperty() public relatedObject: Firestore.DocumentReference,
        @JsonProperty() public notification: NotificationMessage,
        @JsonProperty('notification_data') public notificationData: Map<string, any>,
        @JsonProperty('android_click_action') public androidClickAction: string,
        @JsonProperty('apns_category') public apnsCategory: string,
        @JsonProperty('planned_date_of_dispatch') public plannedDateOfDispatch: Firestore.Timestamp,
        @JsonProperty('resending_period') public resendingPeriod: number
    ) {}
}
