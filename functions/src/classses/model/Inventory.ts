import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

import Firestore = admin.firestore;

@Serializable()
export class Inventory {
    constructor(
        @JsonProperty() public name: string,
        @JsonProperty() public description: string,
        @JsonProperty() public count: number,
        @JsonProperty('inventory_list') public inventoryList: Firestore.DocumentReference,
        @JsonProperty('replacement_frequency') public replacementFrequency: number,
        @JsonProperty('last_replacement_date') public lastReplacementDate: Firestore.Timestamp,
        @JsonProperty('next_replacement_date') public nextReplacementDate: Firestore.Timestamp,
        @JsonProperty('life_time') public lifeTime: number,
        @JsonProperty('object') public housing: Firestore.DocumentReference,
        @JsonProperty() public room: Firestore.DocumentReference,
        @JsonProperty('installation_date') public installationDate: Firestore.Timestamp,
        @JsonProperty('date_created') public dateCreated: Firestore.Timestamp,
    ) {}
}
