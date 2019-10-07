import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";

export class GeneralFunctions {
    /**
     * Удаляет все связанные с объектом уведомления
     * @param snapshot
     */
    deleteRelatedNotifications(snapshot: DocumentSnapshot): Promise<any> {
        const ref = snapshot.ref;
        const query = admin.firestore()
            .collection(FirestoreCollection.Notifications)
            .where("related_object", "==", ref);
        return Helper.firestore().deleteAllFilesInQuery(query);
    }

    /**
     * Удаляет все фотографии добавленные в инвентарь
     * @param snapshot
     */
    deleteRelatedPhotos(snapshot: DocumentSnapshot): Promise<any> {
        const photosCollection = snapshot.ref.collection(FirestoreCollection.Photos);
        return Helper.firestore().deleteAllFilesInQuery(photosCollection);
    }

}
