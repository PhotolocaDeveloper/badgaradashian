import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as handlers from "./handlers";
import {FirestoreCollection} from "./enums/FirestoreCollection";

admin.initializeApp();

export const onUserCreate = functions.auth.user().onCreate(handlers.onUserCreateHandler);
export const onUserDelete = functions.auth.user().onDelete(handlers.onUserDeleteHandler);

export const onInventoryCreate = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onCreate(handlers.onInventoryCreateHandler);

export const onInventoryDelete = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onDelete(handlers.onInventoryDeleteHandler);

export const onInventoryUpdate = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onUpdate(handlers.onInventoryUpdateHandler);

export const onInventoryPhotosDelete = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.onPhotoDeleteHandler);

export const onCaseToDoCreate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onCreate(handlers.onCaseToDoCreateHandler);

export const onCaseToDoDelete = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onDelete(handlers.onCaseToDoDeleteHandler);

export const onCaseToDoUpdate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onUpdate(handlers.onCaseToDoUpdateHandler);

export const onCaseToDoPhotosDelete = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.onPhotoDeleteHandler);

export const onCaseToDoListDelete = functions.firestore
    .document(FirestoreCollection.TaskLists + "/{id}")
    .onDelete(handlers.onCaseToDoListDeleteHandler);

export const onShoppingListItemCreate = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}")
    .onCreate(handlers.onShoppingListItemCreateHandler);

export const onShoppingListItemDelete = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}")
    .onDelete(handlers.onShoppingListItemDeleteHandler);

export const onShoppingListItemDUpdate = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}")
    .onUpdate(handlers.onShoppingListItemUpdateHandler);

export const onShoppingListItemPhotosDelete = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.onPhotoDeleteHandler);

export const onShoppingListDelete = functions.firestore
    .document(FirestoreCollection.BuyLists + "/{id}")
    .onDelete(handlers.onShoppingListDeleteHandler);

export const onRoomDelete = functions.firestore
    .document(FirestoreCollection.Rooms + "/{id}")
    .onDelete(handlers.onRoomDeleteHandler);

export const onHousingDelete = functions.firestore
    .document(FirestoreCollection.Housings + "/{id}")
    .onDelete(handlers.onHousingDeleteHandler);
