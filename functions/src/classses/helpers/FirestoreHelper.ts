import * as admin from "firebase-admin";

export class FirestoreHelper {

    deleteAllFilesInQuery(querySnapshot: admin.firestore.QuerySnapshot): Promise<any> {
        return Promise.all(querySnapshot.docs.map(document => document.ref.delete()));
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
}
