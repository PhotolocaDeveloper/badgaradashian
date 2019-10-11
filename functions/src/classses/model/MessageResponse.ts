import {JsonProperty, Serializable} from "typescript-json-serializer";

@Serializable()
export class MessageResponse {
    @JsonProperty() error: Object | undefined;
    @JsonProperty("message_id") messageId: string | undefined;
    @JsonProperty() success: boolean | undefined
}
