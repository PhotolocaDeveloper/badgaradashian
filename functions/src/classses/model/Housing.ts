import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import {Photo} from "./Photo";
import Firestore = admin.firestore;

@Serializable()
export class Housing {

    static Fields = class {
        static readonly NAME = "name";
        static readonly DESCRIPTION = "description";
        static readonly USER = "user";
        static readonly DATE_CREATED = "date_created";
        static readonly INVENTORIES_COUNT = "inventories_count";
        static readonly INVENTORIES_LISTS_COUNT = "inventory_lists_count";
        static readonly ROOMS_COUNT = "rooms_count";
        static readonly TASKS_COUNT = "tasks_count";
        static readonly DONE_TASKS_COUNT = "done_task_count";
    };

    @JsonProperty() name?: string;
    @JsonProperty() description?: string;
    @JsonProperty() user?: Firestore.DocumentReference;
    @JsonProperty("date_created") dateCreated?: Firestore.Timestamp;
    @JsonProperty('inventories_count') inventoriesCount?: number;
    @JsonProperty('inventory_lists_count') inventoryListsCount?: number;
    @JsonProperty('rooms_count') roomsCount?: number;

    photos?: Photo[];
}
