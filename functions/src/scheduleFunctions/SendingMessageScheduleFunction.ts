import * as admin from "firebase-admin";
import {deserialize, serialize} from "typescript-json-serializer";
import {NotificationPlanned} from "../classses/model/NotificationPlanned";
import {MessagePlannedAdapter} from "../classses/adapters/MessagePlannedAdapter";
import {Helper} from "../classses/helpers/Helper";
import {MessageResponse} from "../classses/model/MessageResponse";
import Message = admin.messaging.Message;

export async function sendingMessageScheduleFunction() {
    const eventTime = admin.firestore.Timestamp.now();
    const plannedMessages = await getPlannedMessages(eventTime);
    const messages = await plannedMessagesToMessages(plannedMessages);

    console.info("Messages count = " + messages.length);

    if (messages.length === 0) return;

    return admin.messaging().sendAll(messages).then(res => {
        return Helper.firestore().notificationScheduleDoc(eventTime).set({
            "success_count": res.successCount,
            "failure_count": res.failureCount,
            "responses": res.responses.map(item => {
                const messageResponse = new MessageResponse();
                messageResponse.success = item.success;
                messageResponse.messageId = item.messageId;
                if (item.error) {
                    messageResponse.error = item.error.toJSON()
                }
                return serialize(messageResponse);
            })
        })
    })
}


/**
 * Получает сообщения для отправки за определённый период
 */
async function getPlannedMessages(eventTime: admin.firestore.Timestamp): Promise<NotificationPlanned[]> {
    const messagesSnapshot = await Helper.firestore().notificationScheduleCollection(eventTime).get();
    return messagesSnapshot.docs.map(document => {
        const message = deserialize(document.data(), NotificationPlanned);
        message.id = document.ref.id;
        console.info(message);
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
