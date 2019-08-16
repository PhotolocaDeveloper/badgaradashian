import {JsonProperty, Serializable} from "typescript-json-serializer";

@Serializable()
export class UserSetting {

    constructor(
        @JsonProperty() public type: UserSettingType,
        @JsonProperty('user_id') public userId : String
    ) {}

}

export enum UserSettingType {
    Notification = "NOTIF",
    Synchronization = "SYNCH"
}
