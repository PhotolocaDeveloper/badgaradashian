import * as admin from "firebase-admin";
import {IMessageBuilder} from "../../interfases/IMessageBuilder";
import Message = admin.messaging.Message;

export class TokenMessageBuilder implements IMessageBuilder {

    constructor(private token: string) {
    }

    build(): Message {
        return {
            token: this.token
        }
    }

}
