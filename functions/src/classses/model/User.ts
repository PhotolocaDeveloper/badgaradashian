import {JsonProperty, Serializable} from "typescript-json-serializer";

@Serializable()
export class User {
    public constructor(
        @JsonProperty() public name: string,
        @JsonProperty() public phone: string,
        @JsonProperty() public email: string,
        @JsonProperty() public registerType: UserRegisterType
    ) {}
}

enum UserRegisterType {
    PHONE = 'phone',
    EMAIL = 'email'
}
