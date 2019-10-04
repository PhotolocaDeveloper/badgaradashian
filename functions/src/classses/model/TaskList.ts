import {JsonProperty} from "typescript-json-serializer";
import * as admin from "firebase-admin";

export class TaskList {
    @JsonProperty() name?: string;
    @JsonProperty() icon?: string;
    @JsonProperty() user?: admin.firestore.DocumentReference;
    @JsonProperty('items_count') itemsCount?: number;
    @JsonProperty('active_items_count') activeItemsCount?: number;
    @JsonProperty("date_created") dateCreated?: admin.firestore.Timestamp;
    @JsonProperty('date_to_do') dateToDo?: admin.firestore.Timestamp;
}
