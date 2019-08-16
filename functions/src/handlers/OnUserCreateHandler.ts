import {UserSettingSynchronization} from "../classses/model/UserSettingSynchronization";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";
import {UserRecord} from "firebase-functions/lib/providers/auth";
import {serialize} from "typescript-json-serializer";

/**
 * Инициализирует настройки синхронизации с Google Calendar при создании пользователя.
 * @param userRecord
 */
export function onUserCreateHandler(userRecord: UserRecord) {

    const userId = userRecord.uid;
    const userSettingSyncronization = new UserSettingSynchronization(userId);

    return admin.firestore()
        .collection(FirestoreCollection.UserSettings)
        .doc()
        .set(serialize(userSettingSyncronization));
}
