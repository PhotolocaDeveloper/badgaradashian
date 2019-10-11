import {IdentifierBuilder} from "../../abstract/IdentifierBuilder";
import {UserSettingType} from "../../model/UserSetting";

export class IBSyncUserSettings extends IdentifierBuilder {

    constructor(private uid: string) {
        super()
    }

    build(): void {
        this.id = this.uid + UserSettingType.Synchronization
    }

}
