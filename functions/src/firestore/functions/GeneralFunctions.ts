import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";
import {Change} from "firebase-functions";
import WriteBatch = admin.firestore.WriteBatch;
import FieldValue = admin.firestore.FieldValue;
import FieldPath = admin.firestore.FieldPath;

export class GeneralFunctions {
    /**
     * Удаляет все связанные с объектом уведомления
     * @param snapshot
     */
    deleteRelatedNotifications(snapshot: DocumentSnapshot): Promise<any> {
        console.info("Started: deleteRelatedNotifications");
        const ref = snapshot.ref;
        const query = admin.firestore()
            .collection(FirestoreCollection.Notifications)
            .where("related_object", "==", ref);
        console.info("Finished: deleteRelatedNotifications");
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

    copyToLocalCollection(snapshot: DocumentSnapshot, field: admin.firestore.FieldPath, subCollectionName?: string, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const documentReference = this.inLocalCollectionDocumentReference(snapshot, field, subCollectionName || "items");
        if (documentReference !== undefined)
            batch.set(documentReference, snapshot.data()!);
        return batch;
    }

    removeFormLocalCollection(snapshot: DocumentSnapshot, field: admin.firestore.FieldPath, subCollectionName?: string, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const documentReference = this.inLocalCollectionDocumentReference(snapshot, field, subCollectionName || "items");
        if (documentReference !== undefined)
            batch.delete(documentReference);
        return batch;
    }

    updateAtLocalCollection(change: Change<DocumentSnapshot>, field: admin.firestore.FieldPath, subCollectionName?: string, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const itemInListRefBefore = this.inLocalCollectionDocumentReference(change.before, field, subCollectionName || "items");
        const itemInListRefAfter = this.inLocalCollectionDocumentReference(change.after, field, subCollectionName || "items");

        if (itemInListRefBefore !== undefined && itemInListRefBefore !== itemInListRefAfter)
            batch.delete(itemInListRefBefore);

        if (itemInListRefAfter !== undefined)
            batch.set(itemInListRefAfter, change.after.data()!);

        return batch
    }

    inLocalCollectionDocumentReference(snapshot: DocumentSnapshot, field: admin.firestore.FieldPath, subCollectionName: string): admin.firestore.DocumentReference | undefined {
        const parentReference = snapshot.get(field);
        if (parentReference instanceof admin.firestore.DocumentReference)
            return parentReference.collection(subCollectionName).doc(snapshot.id);
        return undefined
    }

    updateCountInParentCollection(snapshot: DocumentSnapshot, field: FieldPath, count: number, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const fieldValue = FieldValue.increment(count);
        const ref = snapshot.ref.parent.parent;
        if (ref) {
            batch.update(ref, field, fieldValue)
        }
        return batch
    }

    updateCounter(snapshot: DocumentSnapshot, refField: string, counterField: string, count: number, _batch?: WriteBatch): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const ref: FirebaseFirestore.DocumentReference | null | undefined = snapshot.get(refField);
        if (!ref) return batch;
        return Helper.firestore().incrementFieldWithBatch(batch, ref, counterField);
    }
    


}
