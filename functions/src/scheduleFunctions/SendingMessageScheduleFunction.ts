import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";
import {deserialize, serialize} from "typescript-json-serializer";
import {NotificationPlanned} from "../classses/model/NotificationPlanned";
import {MessagePlannedAdapter} from "../classses/adapters/MessagePlannedAdapter";
import {MessageSetting} from "../classses/model/MessageSetting";
import {Helper} from "../classses/helpers/Helper";
import Message = admin.messaging.Message;

export async function sendingMessageScheduleFunction() {
    const eventTime = admin.firestore.Timestamp.now();
    const messageSettings = await getMessageSettings();
    const plannedMessages = await getPlannedMessages(eventTime);
    const messages = await plannedMessagesToMessages(plannedMessages);

    console.debug("Messages count = " + messages.length);

    if (messages.length === 0) return;

    messageSettings.lastSuccessfullySendTime = eventTime;

    return admin.messaging().sendAll(messages).then(() => {
        return Promise.all([
            cleanNotification(messageSettings),
            setMessagingSettings(messageSettings)
        ])
    });
}

/**
 * Получает настройки уведомлений сервера
 */
async function getMessageSettings(): Promise<MessageSetting> {
    return await admin.firestore()
        .collection(FirestoreCollection.SERVICES)
        .doc("notifications")
        .get()
        .then(snapshot => {
            return deserialize(snapshot.data(), MessageSetting)
        })
}

function setMessagingSettings(settings: MessageSetting) {
    return admin.firestore()
        .collection(FirestoreCollection.Notifications)
        .doc("settings")
        .update(serialize(settings))
}

function cleanNotification(settings: MessageSetting) {
    const query = admin.firestore().collection(FirestoreCollection.Notifications)
        .where('planned_date_of_dispatch', '<', settings.lastSuccessfullySendTime);
    return Helper.firestore().deleteAllFilesInQuery(query);
}

/**
 * Получает сообщения для отправки за определённый период
 */
async function getPlannedMessages(to: admin.firestore.Timestamp): Promise<NotificationPlanned[]> {
    const messagesSnapshot = await admin.firestore()
        .collection(FirestoreCollection.Notifications)
        .where('planned_date_of_dispatch', "<", to)
        .get();
    return messagesSnapshot.docs.map(document => deserialize(document.data(), NotificationPlanned));
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
