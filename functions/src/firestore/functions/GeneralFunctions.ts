import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";

export class GeneralFunctions {
    /**
     * Удаляет все связанные с объектом уведомления
     * @param snapshot
     * @param context
     */
    deleteRelatedNotifications(snapshot: DocumentSnapshot, context: EventContext): Promise<any> {
        const ref = snapshot.ref;

        return admin.firestore()
            .collection(FirestoreCollection.Notifications)
            .where("related_object", "==", ref)
            .get()
            .then(Helper.firestore().deleteAllFilesInQuery)
    }

    /**
     * Удаляет все фотографии добавленные в инвентарь
     * @param snapshot
     * @param context
     */
    deleteRelatedPhotos(snapshot: DocumentSnapshot, context: EventContext): Promise<any> {
        const photosCollection = snapshot.ref.collection(FirestoreCollection.Photos);
        return photosCollection.get().then(Helper.firestore().deleteAllFilesInQuery)
    }

    /**
     * Удаляет все документы в коллекции
     * @param querySnapshot
     */
    deleteAllFilesInQuery(querySnapshot: admin.firestore.QuerySnapshot): Promise<any> {
        return Promise.all(querySnapshot.docs.map(document => document.ref.delete()));
    }

}
