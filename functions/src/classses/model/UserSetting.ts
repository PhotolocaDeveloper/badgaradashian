import {JsonProperty, Serializable} from "typescript-json-serializer";
import {Md5} from "md5-typescript";

@Serializable()
export class UserSetting {

    constructor(
        @JsonProperty() public type: UserSettingType,
        @JsonProperty('user_id') public userId : String
    ) {}

    get id(): string {
        return Md5.init(this.id_raw)
    }

    protected get id_raw(): string {
        return this.userId + this.type
    }

}

export enum UserSettingType {
    Notification = "NOTIF",
    Synchronization = "SYNCH",
    DefaultValues = "DEFAULT_VALUES"
}
