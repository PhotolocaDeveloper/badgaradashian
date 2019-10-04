import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import Firestore = admin.firestore;

@Serializable()
export class Room {
    @JsonProperty() name?: string;
    @JsonProperty() description?: string;
    @JsonProperty() object?: Firestore.DocumentReference;
    @JsonProperty() user?: Firestore.DocumentReference;
    @JsonProperty('date_created') dateCreated?: Firestore.Timestamp;

    @JsonProperty('inventories_count') inventoriesCount?: number;
    @JsonProperty('inventory_lists_count') inventoryListsCount?: number;
}
