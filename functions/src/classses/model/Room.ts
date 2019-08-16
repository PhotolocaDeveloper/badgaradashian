import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

import Firestore = admin.firestore;

@Serializable()
export class Room {
    constructor(
        @JsonProperty() public name: string,
        @JsonProperty() public description: string,
        @JsonProperty() public object: Firestore.DocumentReference,
        @JsonProperty() public user: Firestore.DocumentReference,
        @JsonProperty('date_created') public dateCreated: Firestore.Timestamp
    ) {}
}
