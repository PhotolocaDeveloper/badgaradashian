import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {NotificationPlanned} from "../../classses/model/NotificationPlanned";
import * as admin from "firebase-admin";
import {Helper} from "../../classses/helpers/Helper";

export class NotificationFunctions {

    private static toObject(snapshot: DocumentSnapshot): NotificationPlanned | undefined {
        return Helper.firestore().deserialize(snapshot, NotificationPlanned)
    }

    addToSchedule(snapshot: DocumentSnapshot, _batch?: admin.firestore.WriteBatch): admin.firestore.WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = NotificationFunctions.toObject(snapshot);
        if (item === undefined || item.plannedDateOfDispatch === undefined) return batch;
        const scheduleCollection = Helper.firestore().notificationScheduleCollection(item.plannedDateOfDispatch);
        const newDocRef = scheduleCollection.doc(snapshot.id);
        batch.set(newDocRef, snapshot.data()!);
        return batch
    }

    removeFormSchedule(snapshot: DocumentSnapshot, _batch?: admin.firestore.WriteBatch): admin.firestore.WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const item = NotificationFunctions.toObject(snapshot);
        if (item === undefined || item.plannedDateOfDispatch === undefined) return batch;
        const scheduleCollection = Helper.firestore().notificationScheduleCollection(item.plannedDateOfDispatch);
        const docRef = scheduleCollection.doc(snapshot.id);
        batch.delete(docRef);
        return batch;
    }
}
