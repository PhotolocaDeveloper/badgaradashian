import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import {Photo} from "./Photo";
import Firestore = admin.firestore;

@Serializable()
export class Housing {

    @JsonProperty() name?: string;
    @JsonProperty() description?: string;
    @JsonProperty() user?: Firestore.DocumentReference;
    @JsonProperty("date_created") dateCreated?: Firestore.Timestamp;
    @JsonProperty('inventories_count') inventoriesCount?: number;
    @JsonProperty('inventory_lists_count') inventoryListsCount?: number;
    @JsonProperty('rooms_count') roomsCount?: number;

    photos?: Photo[];
}
