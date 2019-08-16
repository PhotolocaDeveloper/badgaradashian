import {UserSetting, UserSettingType} from "./UserSetting";
import {JsonProperty, Serializable} from "typescript-json-serializer";

@Serializable('UserSetting')
export class UserSettingSynchronization extends UserSetting {

    @JsonProperty('is_sync_on') isSynchronizationOn: boolean;

    constructor(
        userId: string
    ) {
        super(UserSettingType.Synchronization, userId);
        this.isSynchronizationOn = false;
    }

}
