import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize, serialize} from "typescript-json-serializer";
import {Inventory} from "../classses/model/Inventory";
import {InventoryEndsNotifBuilder} from "../classses/notification/builders/InventoryEndsNotifBuilder";
import {NotificationCreator} from "../classses/notification/NotificationCreator";
import {EventContext} from "firebase-functions";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";

export function onInventoryCreateHandler(snapshot: DocumentSnapshot, context: EventContext) {
    if (context.auth == null) return;
    return createOnInventoryEndsNotification(context.auth.uid, snapshot);
}

function createOnInventoryEndsNotification(uid: string, snapshot: DocumentSnapshot) {
    const inventory = deserialize(snapshot.data(), Inventory);
    const notificationBuilder = new InventoryEndsNotifBuilder(uid, snapshot.ref, inventory);
    const notificationCreator = new NotificationCreator(notificationBuilder);
    notificationCreator.constructNotification();
    const notification = notificationCreator.getNotification();
    return admin.firestore().collection(FirestoreCollection.Notifications).doc().create(serialize(notification));
}
