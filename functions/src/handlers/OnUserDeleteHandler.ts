import {UserRecord} from "firebase-functions/lib/providers/auth";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";
import {Helper} from "../classses/helpers/Helper";

/***
 * Удаляет настройки связанные с поьзователем после его удаленяия
 * @param userRecord
 */
export function onUserDeleteHandler(userRecord: UserRecord) {
    const userId = userRecord.uid;

    return admin.firestore()
        .collection(FirestoreCollection.UserSettings)
        .where("user_id", "==", userId)
        .get()
        .then(Helper.firestore().deleteAllFilesInQuery)
}
