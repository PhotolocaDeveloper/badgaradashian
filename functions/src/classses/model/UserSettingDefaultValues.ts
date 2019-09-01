import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import {UserSetting, UserSettingType} from "./UserSetting";

@Serializable('UserSetting')
export class UserSettingDefaultValues extends UserSetting {
    @JsonProperty('autogenerated_buy_list') autoGeneratedBuyList?: admin.firestore.DocumentReference;

    constructor(uid: string) {
        super(UserSettingType.DefaultValues, uid);
    }

}