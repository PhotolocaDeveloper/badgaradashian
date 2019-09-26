import * as admin from "firebase-admin";
import Message = admin.messaging.Message;

export interface IMessageBuilder {
    build(): Message;
}
