import {UserSetting, UserSettingType} from "./UserSetting";
import {JsonProperty, Serializable} from "typescript-json-serializer";
import {Md5} from "md5-typescript";

@Serializable('UserSetting')
export class UserSettingNotification extends UserSetting {

    constructor(
        userId: string,
        @JsonProperty('device_id') public deviceId: string,
        @JsonProperty('is_notification_on') public isNotificationOn: boolean,
        @JsonProperty('fmc_token') public fmcToken: string
    ) {
        super(UserSettingType.Notification, userId)
    }

    get id(): string {
        return Md5.init(this.id_raw)
    }

    protected get id_raw(): string {
        return super.id + this.deviceId
    }
}
