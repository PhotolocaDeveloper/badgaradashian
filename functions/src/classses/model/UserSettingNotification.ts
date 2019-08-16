import {UserSetting, UserSettingType} from "./UserSetting";
import {JsonProperty, Serializable} from "typescript-json-serializer";

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
}
