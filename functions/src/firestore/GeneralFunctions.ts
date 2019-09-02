import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";
import {FirestoreHelper} from "../classses/helpers/FirestoreHelper";

export namespace GeneralFunctions {
    /**
     * Удаляет все связанные с объектом уведомления
     * @param snapshot
     * @param context
     */
    export function deleteRelatedNotifications(snapshot: DocumentSnapshot, context: EventContext): Promise<any> {
        const ref = snapshot.ref;

        return admin.firestore()
            .collection(FirestoreCollection.Notifications)
            .where("related_object", "==", ref)
            .get()
            .then(FirestoreHelper.deleteAllFilesInQuery)
    }

    /**
     * Удаляет все фотографии добавленные в инвентарь
     * @param snapshot
     * @param context
     */
    export function deleteRelatedPhotos(snapshot: DocumentSnapshot, context: EventContext): Promise<any> {
        const photosCollection = snapshot.ref.collection(FirestoreCollection.Photos);
        return photosCollection.get().then(FirestoreHelper.deleteAllFilesInQuery)
    }
}
