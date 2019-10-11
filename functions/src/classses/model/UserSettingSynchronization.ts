import {UserSetting, UserSettingType} from "./UserSetting";
import {JsonProperty, Serializable} from "typescript-json-serializer";
import {Credentials} from "google-auth-library";

@Serializable('UserSetting')
export class UserSettingSynchronization extends UserSetting {

    @JsonProperty('is_sync_on') isSynchronizationOn: boolean;

    @JsonProperty('tokens') tokens?: Credentials;

    constructor(
        userId: string
    ) {
        super(UserSettingType.Synchronization, userId);
        this.isSynchronizationOn = false;
    }

}
