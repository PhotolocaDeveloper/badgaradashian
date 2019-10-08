import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import {AppEvent} from "../../enums/AppEvent";
import {NotificationType} from "../../enums/NotificationType";
import Firestore = admin.firestore;

@Serializable()
export class NotificationPlanned {

    id?: string;

    @JsonProperty()
    recipient?: string;

    @JsonProperty()
    type?: NotificationType;

    @JsonProperty('related_object')
    relatedObject?: Firestore.DocumentReference;

    @JsonProperty('notification_title')
    notificationTitle?: string;

    @JsonProperty('notification_body')
    notificationBody?: string;

    @JsonProperty('notification_data')
    notificationData?: any;

    @JsonProperty('android_click_action')
    androidClickAction?: string;

    @JsonProperty('apns_category')
    apnsCategory?: string;

    @JsonProperty('planned_date_of_dispatch')
    plannedDateOfDispatch?: Firestore.Timestamp;

    @JsonProperty('resending_period')
    resendingPeriod?: number;

    @JsonProperty()
    event?: AppEvent;

}
