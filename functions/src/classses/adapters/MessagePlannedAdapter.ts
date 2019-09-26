import {NotificationPlanned} from "../model/NotificationPlanned";
import * as admin from "firebase-admin";
import {NotificationType} from "../../enums/NotificationType";
import {TopicMessageBuilder} from "../builders/messages/TopicMessageBuilder";
import {TokenMessageBuilder} from "../builders/messages/TokenMessageBuilder";
import {MessageBuilder} from "../builders/messages/MessageBuilder";
import {UserSettingType} from "../model/UserSetting";
import {deserialize} from "typescript-json-serializer";
import {UserSettingNotification} from "../model/UserSettingNotification";
import Message = admin.messaging.Message;

export class MessagePlannedAdapter {

    constructor(
        private messagePlanned: NotificationPlanned
    ) {
    }

    private _messages: Message[] = [];

    get messages(): admin.messaging.Message[] {
        return this._messages;
    }

    private static constructMessage(recipient: string, notification: NotificationPlanned) {
        const messageBuilder = new MessageBuilder();

        switch (notification.type) {
            case NotificationType.Broadcast:
                messageBuilder.buildRecipient(new TopicMessageBuilder(recipient));
                break;
            case NotificationType.Personal:
                messageBuilder.buildRecipient(new TokenMessageBuilder(recipient));
                break;
        }

        return messageBuilder
            .buildNotification(notification.notificationTitle, notification.notificationBody)
            .buildData(notification.notificationData)
            .buildAndroid(notification.androidClickAction)
            .buildApns(notification.apnsCategory)
            .build();
    }

    async buildMessages() {
        if (this.messagePlanned.type == NotificationType.Personal) {
            this._messages = await this.buildPersonalMessage(this.messagePlanned)
        } else {
            this._messages = [this.buildBroadcastMessage(this.messagePlanned)]
        }
    }

    private async buildPersonalMessage(notification: NotificationPlanned): Promise<Message[]> {
        const notificationSettingsSnapshot = await admin.firestore().collection("user_settings")
            .where("type", '==', UserSettingType.Notification)
            .where("user_id", '==', notification.recipient)
            .where('is_notification_on', '==', true)
            .get();

        return notificationSettingsSnapshot.docs
            .map(doc => {
                const settings = deserialize(doc.data(), UserSettingNotification);
                return settings.fmcToken
            })
            .filter(token => token !== undefined)
            .map(token =>
                MessagePlannedAdapter.constructMessage(token!, notification)
            )
    }

    private buildBroadcastMessage(notification: NotificationPlanned): Message {
        const recipient = this.messagePlanned.recipient || "";
        return MessagePlannedAdapter.constructMessage(recipient, notification)
    }
}
