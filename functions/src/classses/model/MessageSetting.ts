import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

@Serializable()
export class MessageSetting {
    @JsonProperty('last_successfully_send_time') lastSuccessfullySendTime?: admin.firestore.Timestamp;
}
