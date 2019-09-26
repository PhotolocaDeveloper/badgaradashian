import {IMessageBuilder} from "../../interfases/IMessageBuilder";
import * as admin from "firebase-admin";
import Message = admin.messaging.Message;

export class TopicMessageBuilder implements IMessageBuilder {

    constructor(private topic: string) {
    }

    build(): Message {
        return {
            topic: this.topic
        }
    }

}
