import {Functions} from "../firestore/Functions";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";
import Timestamp = admin.firestore.Timestamp;

export async function resetTasksCompletion() {
    const batch = admin.firestore().batch();
    const eventTime = Timestamp.now();
    const querySnapshot = await Functions.task().getScheduleCollection(eventTime).get();
    querySnapshot.docs.forEach(doc => {
        const ref = admin.firestore().collection(FirestoreCollection.Tasks).doc(doc.id);
        Functions.task().resetChecker(doc, ref, undefined, batch)
    });
    return batch.commit()
}
