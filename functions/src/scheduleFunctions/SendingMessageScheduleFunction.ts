import * as admin from "firebase-admin";
import {deserialize} from "typescript-json-serializer";
import {NotificationPlanned} from "../classses/model/NotificationPlanned";
import {MessagePlannedAdapter} from "../classses/adapters/MessagePlannedAdapter";
import {Helper} from "../classses/helpers/Helper";
import Message = admin.messaging.Message;

export async function sendingMessageScheduleFunction() {
    const eventTime = admin.firestore.Timestamp.now();
    const plannedMessages = await getPlannedMessages(eventTime);
    const messages = await plannedMessagesToMessages(plannedMessages);

    console.debug("Messages count = " + messages.length);

    if (messages.length === 0) return;

    return admin.messaging().sendAll(messages);
}

/**
 * Получает сообщения для отправки за определённый период
 */
async function getPlannedMessages(eventTime: admin.firestore.Timestamp): Promise<NotificationPlanned[]> {
    const messagesSnapshot = await Helper.firestore().notificationScheduleCollection(eventTime).get();
    return messagesSnapshot.docs.map(document => {
        const message = deserialize(document.data(), NotificationPlanned);
        message.referencePath = document.ref.path;
        return message
    });
}

/**
 * Приводит запланированные к отправке сообщения в формат Cloud Messaging
 * @param plannedMessages
 */
async function plannedMessagesToMessages(plannedMessages: NotificationPlanned[]): Promise<Message[]> {
    let messages: Message[] = [];

    for (const plannedMessage of plannedMessages) {
        const messageAdapter = new MessagePlannedAdapter(plannedMessage);
        await messageAdapter.buildMessages();
        messages = [...messages, ...messageAdapter.messages]
    }

    return messages
}
