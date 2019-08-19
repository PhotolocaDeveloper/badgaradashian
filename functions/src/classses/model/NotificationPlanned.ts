import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

import Firestore = admin.firestore;
import {AppEvent} from "../../enums/AppEvent";
import {NotificationType} from "../../enums/NotificationType";

@Serializable()
export class NotificationPlanned {

    @JsonProperty()
    recipient: string | null | Array<string> = null;

    @JsonProperty()
    type: NotificationType | null = null;

    @JsonProperty('related_object')
    relatedObject: Firestore.DocumentReference | null = null;

    @JsonProperty('notification_title')
    notificationTitle: string | null = null;

    @JsonProperty('notification_body')
    notificationBody: string | null = null;

    @JsonProperty('notification_data')
    notificationData: any | null = null;

    @JsonProperty('android_click_action')
    androidClickAction: string | null = null;

    @JsonProperty('apns_category')
    apnsCategory: string | null = null;

    @JsonProperty('planned_date_of_dispatch')
    plannedDateOfDispatch: Firestore.Timestamp | null = null;

    @JsonProperty('resending_period')
    resendingPeriod: number | null = null;

    @JsonProperty()
    event: AppEvent | null = null;

}
