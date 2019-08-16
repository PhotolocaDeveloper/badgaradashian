import {UserRecord} from "firebase-functions/lib/providers/auth";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";

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
        .then(removeUserSettings)
}

function removeUserSettings(querySnapshot: FirebaseFirestore.QuerySnapshot) {
    querySnapshot.docs.forEach( document => document.ref.delete() )
}
