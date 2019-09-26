import {TokenMessageBuilder} from "./TokenMessageBuilder";
import {TopicMessageBuilder} from "./TopicMessageBuilder";
import * as admin from "firebase-admin";
import {IMessageBuilder} from "../../interfases/IMessageBuilder";
import Notification = admin.messaging.Notification;
import Message = admin.messaging.Message;

export class MessageBuilder implements IMessageBuilder {

    recipientBuilder!: TokenMessageBuilder | TopicMessageBuilder;

    title?: string;
    body?: string;

    notification?: Notification;
    data?: { [key: string]: string };

    apnsCategory?: string;
    clickAction?: string;

    buildNotification(title?: string, body?: string) {
        this.title = title;
        this.body = body;
        return this;
    }

    buildData(data?: { [key: string]: string }) {
        this.data = data;
        return this;
    }

    buildAndroid(clickAction?: string) {
        this.clickAction = clickAction;
        return this;
    }

    buildApns(apnsCategory?: string) {
        this.apnsCategory = apnsCategory;
        return this;
    }

    buildRecipient(recipientBuilder: TokenMessageBuilder | TopicMessageBuilder) {
        this.recipientBuilder = recipientBuilder;
        return this;
    }

    build(): Message {
        const message = this.recipientBuilder.build();

        // message.notification = {
        //         //     title: this.title || "",
        //         //     body: this.body || ""
        //         // };

        message.data = this.data || {};
        message.data["title"] = this.title || "";
        message.data["body"] = this.body || "";
        message.data['click_action'] = this.clickAction || "";

        message.apns = {
            payload: {
                aps: {
                    alert: {
                        title: this.title || "",
                        body: this.body || ""
                    },
                    category: this.apnsCategory,
                    "content-available": 1
                },
            }
        };
        return message;
    }

}
