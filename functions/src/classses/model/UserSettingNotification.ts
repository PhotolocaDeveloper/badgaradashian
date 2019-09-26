import {UserSetting, UserSettingType} from "./UserSetting";
import {JsonProperty, Serializable} from "typescript-json-serializer";
import {Md5} from "md5-typescript";

@Serializable('UserSetting')
export class UserSettingNotification extends UserSetting {

    @JsonProperty('device_id')
    deviceId?: string;

    @JsonProperty('is_notification_on')
    isNotificationOn?: boolean;

    @JsonProperty('fcm_token')
    fmcToken?: string;

    constructor(
        userId: string
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
