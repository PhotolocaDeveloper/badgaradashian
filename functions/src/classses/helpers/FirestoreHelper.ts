import * as admin from "firebase-admin";
import {Helper} from "./Helper";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {deserialize} from "typescript-json-serializer";

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
        const incrementCount = count === undefined ? 1 : count;
        const increment = admin.firestore.FieldValue.increment(incrementCount);
        batch.update(documentReference, fieldPath, increment);
        return batch
    }

    decrementFieldWithBatch(batch: admin.firestore.WriteBatch, documentReference: admin.firestore.DocumentReference, fieldPath: string, count?: number) {
        const decCount = count === undefined ? 1 : count;
        const decrement = admin.firestore.FieldValue.increment(-decCount);
        batch.update(documentReference, fieldPath, decrement);
        return batch
    }

    incrementField(documentReference: admin.firestore.DocumentReference, fieldPath: string, count?: number): Promise<any> {
        const incrementCount = count === undefined ? 1 : count;
        const increment = admin.firestore.FieldValue.increment(incrementCount);
        return documentReference.update(fieldPath, increment);
    }

    decrementField(documentReference: admin.firestore.DocumentReference, fieldPath: string, count?: number): Promise<any> {
        const decCount = count === undefined ? 1 : count;
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

    snapshotToObject<T>(snapshot: admin.firestore.DocumentSnapshot, type: new (...params: Array<any>) => T): T | undefined {
        if (!snapshot.exists) return undefined;
        return deserialize(snapshot.data(), type)
    }
}
