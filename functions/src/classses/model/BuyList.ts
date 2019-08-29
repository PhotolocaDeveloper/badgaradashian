import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

@Serializable()
export class BuyList {
    @JsonProperty() name?: string;
    @JsonProperty() user?: admin.firestore.DocumentReference;
    @JsonProperty('date_created') dateCreated?: admin.firestore.Timestamp;
    @JsonProperty('is_hidden') isHidden?: boolean;
}
