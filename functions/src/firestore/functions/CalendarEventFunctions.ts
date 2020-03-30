import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {CalendarEventWrapper} from "../../classses/model/CalendarEventWrapper";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Calendar} from "../../classses/adapters/Calendar";
import WriteBatch = admin.firestore.WriteBatch;
import {Helper} from "../../classses/helpers/Helper";

export class CalendarEventFunctions {
    copyToLocalCollections(snapshot: DocumentSnapshot, _batch?: WriteBatch) {
        const batch = _batch || admin.firestore().batch();
        const eventWrapper = Helper.firestore().deserialize(snapshot, CalendarEventWrapper);
        if (eventWrapper?.relativeObject) {
            const ref = eventWrapper.relativeObject.collection(FirestoreCollection.CalendarEvents).doc(snapshot.id);
            batch.set(ref, snapshot.data()!);
        }
        if (eventWrapper?.user) {
            const ref = eventWrapper.user.collection(FirestoreCollection.CalendarEvents).doc(snapshot.id);
            batch.set(ref, snapshot.data()!)
        }
        return batch;
    }

    deleteFormLocalCollections(snapshot: DocumentSnapshot, _batch?: admin.firestore.WriteBatch) {
        const batch = _batch || admin.firestore().batch();
        const eventWrapper = Helper.firestore().deserialize(snapshot, CalendarEventWrapper);
        if (eventWrapper?.relativeObject) {
            const ref = eventWrapper.relativeObject.collection(FirestoreCollection.CalendarEvents).doc(snapshot.id);
            batch.delete(ref);
        }
        if (eventWrapper?.user) {
            const ref = eventWrapper.user.collection(FirestoreCollection.CalendarEvents).doc(snapshot.id);
            batch.delete(ref)
        }
        return batch;
    }

    async update(snapshot: DocumentSnapshot) {
        if (!snapshot.exists) return Promise.resolve();
        const eventWrapper = Helper.firestore().deserialize(snapshot, CalendarEventWrapper);
        if (!eventWrapper?.user || !eventWrapper?.event || !eventWrapper?.id) {
            return Promise.reject("User or event id not set");
        }
        return await Calendar.getInstance().event.update(eventWrapper.user.id, eventWrapper.id, eventWrapper.event);
    }

    async delete(snapshot: DocumentSnapshot) {
        const eventWrapper = Helper.firestore().deserialize(snapshot, CalendarEventWrapper);
        if (!eventWrapper) {
            return Promise.reject("Can't deserialize event data")
        }
        if (!eventWrapper?.user) {
            return Promise.reject("Relative user is undefined");
        }
        if (!eventWrapper?.id) {
            return Promise.reject("Event data is empty")
        }
        return await Calendar.getInstance().event.delete(eventWrapper.user.id, eventWrapper.id);
    }

    async create(snapshot: DocumentSnapshot) {
        const eventWrapper = Helper.firestore().deserialize(snapshot, CalendarEventWrapper);
        if (!eventWrapper) {
            return Promise.reject("Can't deserialize event data")
        }
        if (!eventWrapper?.user) {
            return Promise.reject("Relative user is undefined");
        }
        if (!eventWrapper?.event) {
            return Promise.reject("Event data is empty")
        }
        // Create event
        const newEventData = await Calendar.getInstance().event.insert(eventWrapper.user.id, eventWrapper.event);

        // Update calendar event data
        if (newEventData && newEventData.data) {
            return await snapshot.ref.update("id", newEventData.data.id);
        } else {
            return Promise.reject("Can not create calendar event uid: " + eventWrapper.user.id)
        }
    }
}
