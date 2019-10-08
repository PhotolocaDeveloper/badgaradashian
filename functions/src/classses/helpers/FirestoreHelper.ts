import * as admin from "firebase-admin";
import {Helper} from "./Helper";
import {FirestoreCollection} from "../../enums/FirestoreCollection";

export class FirestoreHelper {

    deleteAllFilesInQuery(query: admin.firestore.Query) {
        return admin.firestore().runTransaction(transaction => {
            return transaction.get(query).then(snapshots => {
                snapshots.forEach(snapshot => {
                    transaction.delete(snapshot.ref)
                })
            })
        });
    }

    incrementFieldWithBatch(batch: admin.firestore.WriteBatch, documentReference: admin.firestore.DocumentReference, fieldPath: string, count?: number) {
        const incrementCount = count || 1;
        const increment = admin.firestore.FieldValue.increment(incrementCount);
        batch.update(documentReference, fieldPath, increment);
    }

    decrementFieldWithBatch(batch: admin.firestore.WriteBatch, documentReference: admin.firestore.DocumentReference, fieldPath: string, count?: number) {
        const decCount = count || 1;
        const decrement = admin.firestore.FieldValue.increment(-decCount);
        batch.update(documentReference, fieldPath, decrement);
    }

    incrementField(documentReference: admin.firestore.DocumentReference, fieldPath: string, count?: number): Promise<any> {
        const incrementCount = count || 1;
        const increment = admin.firestore.FieldValue.increment(incrementCount);
        return documentReference.update(fieldPath, increment);
    }

    decrementField(documentReference: admin.firestore.DocumentReference, fieldPath: string, count?: number): Promise<any> {
        const decCount = count || 1;
        const decrement = admin.firestore.FieldValue.increment(-decCount);
        return documentReference.update(fieldPath, decrement);
    }

    notificationScheduleId(timestamp: admin.firestore.Timestamp): string {
        const timeMills = timestamp.toMillis() - timestamp.toMillis() % (60 * 1000);
        const date = new Date(timeMills);
        return date.toUTCString();
    }

    notificationScheduleCollection(timestamp: admin.firestore.Timestamp): admin.firestore.CollectionReference {
        const scheduleId = Helper.firestore().notificationScheduleId(timestamp);
        return admin.firestore()
            .collection(FirestoreCollection.NotificationsSchedule)
            .doc(scheduleId).collection("items")
    }
}
