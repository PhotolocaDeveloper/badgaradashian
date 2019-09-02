import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import {FirestoreCollection} from "./enums/FirestoreCollection";
import {
    onCaseToDoCreateHandler,
    onCaseToDoDeleteHandler,
    onCaseToDoUpdateHandler,
    onInventoryCreateHandler,
    onInventoryDeleteHandler,
    onInventoryUpdateHandler,
    onPhotoDeleteHandler,
    onUserCreateHandler,
    onUserDeleteHandler
} from "./handlers";

admin.initializeApp();

export const onUserCreate = functions.auth.user().onCreate(onUserCreateHandler);
export const onUserDelete = functions.auth.user().onDelete(onUserDeleteHandler);

export const onInventoryCreate = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onCreate(onInventoryCreateHandler);

export const onInventoryDelete = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onDelete(onInventoryDeleteHandler);

export const onInventoryUpdate = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onUpdate(onInventoryUpdateHandler);

export const onInventoryPhotosDelete = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}/" + FirestoreCollection.Photos + "/{id}")
    .onDelete(onPhotoDeleteHandler);

export const onCaseToDoCreate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onCreate(onCaseToDoCreateHandler);

export const onCaseToDoDelete = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onDelete(onCaseToDoDeleteHandler);

export const onCaseToDoUpdate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onUpdate(onCaseToDoUpdateHandler);

export const onCaseToDoPhotosDelete = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}/" + FirestoreCollection.Photos + "/{id}")
    .onDelete(onPhotoDeleteHandler);
