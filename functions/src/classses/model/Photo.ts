import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

@Serializable()
export class Photo {
    @JsonProperty() url?: string;
    @JsonProperty() path?: string;
    @JsonProperty('date_created') dateCreated?: admin.firestore.Timestamp;
}
