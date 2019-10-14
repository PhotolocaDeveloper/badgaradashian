import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {deserialize} from "typescript-json-serializer";
import {CalendarEventWrapper} from "../../classses/model/CalendarEventWrapper";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Calendar} from "../../classses/adapters/Calendar";

export class CalendarEventFunctions {
    copyToLocalCollections(snapshot: DocumentSnapshot, _batch?: FirebaseFirestore.WriteBatch) {
        const batch = _batch || admin.firestore().batch();
        if (!snapshot.exists) return batch;
        const eventWrapper = deserialize(snapshot.data(), CalendarEventWrapper);
        if (eventWrapper.relativeObject) {
            const ref = eventWrapper.relativeObject.collection(FirestoreCollection.CalendarEvents).doc(snapshot.id);
            batch.set(ref, snapshot.data()!);
        }
        if (eventWrapper.user) {
            const ref = eventWrapper.user.collection(FirestoreCollection.CalendarEvents).doc(snapshot.id);
            batch.set(ref, snapshot.data()!)
        }
        return batch;
    }

    deleteFormLocalCollections(snapshot: DocumentSnapshot, _batch?: admin.firestore.WriteBatch) {
        const batch = _batch || admin.firestore().batch();
        if (!snapshot.exists) return batch;
        const eventWrapper = deserialize(snapshot.data(), CalendarEventWrapper);
        if (eventWrapper.relativeObject) {
            const ref = eventWrapper.relativeObject.collection(FirestoreCollection.CalendarEvents).doc(snapshot.id);
            batch.delete(ref);
        }
        if (eventWrapper.user) {
            const ref = eventWrapper.user.collection(FirestoreCollection.CalendarEvents).doc(snapshot.id);
            batch.delete(ref)
        }
        return batch;
    }

    update(snapshot: DocumentSnapshot): Promise<any> {
        if (!snapshot.exists) return Promise.resolve();
        const eventWrapper = deserialize(snapshot.data(), CalendarEventWrapper);
        if (!eventWrapper.user || !eventWrapper.event || !eventWrapper.id) return Promise.reject("User or event id not set");
        return Calendar.getInstance().event.update(eventWrapper.user.id, eventWrapper.id, eventWrapper.event);
    }

    delete(snapshot: DocumentSnapshot): Promise<any> {
        if (!snapshot.exists) return Promise.resolve();
        const eventWrapper = deserialize(snapshot.data(), CalendarEventWrapper);
        if (!eventWrapper.user || !eventWrapper.event || !eventWrapper.id) return Promise.reject("User or event id not set");
        return Calendar.getInstance().event.delete(eventWrapper.user.id, eventWrapper.id);
    }

    create(snapshot: DocumentSnapshot): Promise<any> {
        if (!snapshot.exists) return Promise.resolve();
        const eventWrapper = deserialize(snapshot.data(), CalendarEventWrapper);
        if (!eventWrapper.user || !eventWrapper.event) return Promise.resolve();
        return Calendar.getInstance().event.insert(eventWrapper.user.id, eventWrapper.event).then((res): Promise<any> => {
            if (!res || !res.data) return Promise.resolve();
            return snapshot.ref.update("id", res.data.id);
        })
    }
}
