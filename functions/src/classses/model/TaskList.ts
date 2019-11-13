import {JsonProperty} from "typescript-json-serializer";
import * as admin from "firebase-admin";

export class TaskList {

    static Fields = class {
        static readonly NAME = "name";
        static readonly ICON = "icon";
        static readonly USER = "user";
        static readonly ITEMS_COUNT = "items_count";
        static readonly DONE_ITEMS_COUNT = "done_item_count";
        static readonly ACTIVE_ITEMS_COUNT = "active_items_count";
        static readonly DATE_CREATED = "date_created";
        static readonly DATE_TO_DO = "date_to_do";
    };

    @JsonProperty() name?: string;
    @JsonProperty() icon?: string;
    @JsonProperty() user?: admin.firestore.DocumentReference;
    @JsonProperty('items_count') itemsCount?: number;
    @JsonProperty('active_items_count') activeItemsCount?: number;
    @JsonProperty("date_created") dateCreated?: admin.firestore.Timestamp;
    @JsonProperty('date_to_do') dateToDo?: admin.firestore.Timestamp;
}
