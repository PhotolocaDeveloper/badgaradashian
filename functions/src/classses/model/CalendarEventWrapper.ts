import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import {CalendarEvent} from "./CalendarEvent";
import DocumentReference = admin.firestore.DocumentReference;

@Serializable()
export class CalendarEventWrapper {
    @JsonProperty() id?: string;
    @JsonProperty("event_data") event?: CalendarEvent;
    @JsonProperty('user_id') user?: DocumentReference;
    @JsonProperty('relative_object') relativeObject?: DocumentReference;
}
