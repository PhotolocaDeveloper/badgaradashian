import {JsonProperty, Serializable} from "typescript-json-serializer";

@Serializable()
export class NotificationMessage {
    constructor(
        @JsonProperty() public title: string,
        @JsonProperty() public body: string
    ) {}
}
