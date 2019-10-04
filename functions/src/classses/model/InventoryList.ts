import {JsonProperty} from "typescript-json-serializer";
import * as admin from "firebase-admin";

export class InventoryList {
    @JsonProperty() name?: string;
    @JsonProperty() description?: string;
    @JsonProperty() icon?: string;
    @JsonProperty() user?: admin.firestore.DocumentReference;
    @JsonProperty() room?: admin.firestore.DocumentReference;
    @JsonProperty('inventories_count') inventoriesCount?: number;
    @JsonProperty('object') housing?: admin.firestore.DocumentReference;
    @JsonProperty("date_created") dateCreated?: admin.firestore.Timestamp;
}
