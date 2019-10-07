import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as schedule from "./scheduleFunctions"
import * as handlers from './firestore/Handlers'
import {FirestoreCollection} from "./enums/FirestoreCollection";

admin.initializeApp();

export const onUserCreate = functions.auth.user().onCreate(handlers.user.onCreate);
export const onUserDelete = functions.auth.user().onDelete(handlers.user.onDelete);

export const onInventoryCreate = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onCreate(handlers.inventory.onCreate);

export const onInventoryDelete = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onDelete(handlers.inventory.onDelete);

export const onInventoryUpdate = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}")
    .onUpdate(handlers.inventory.onUpdate);

export const onInventoryPhotosDelete = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.photo.onDelete);

export const onInventoryListDelete = functions.firestore
    .document(FirestoreCollection.InventoryLists + "/{id}")
    .onDelete(handlers.inventoryList.onDelete);

export const onInventoryListCreate = functions.firestore
    .document(FirestoreCollection.InventoryLists + "/{id}")
    .onCreate(handlers.inventoryList.onCreate);

export const onInventoryListUpdate = functions.firestore
    .document(FirestoreCollection.InventoryLists + "/{id}")
    .onUpdate(handlers.inventoryList.onUpdate);

export const onCaseToDoCreate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onCreate(handlers.task.onCreate);

export const onCaseToDoDelete = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onDelete(handlers.task.onDelete);

export const onCaseToDoUpdate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onUpdate(handlers.task.onUpdate);

export const onLocalTaskItemCreate = functions.firestore
    .document(FirestoreCollection.TaskLists + "/{id}/" + FirestoreCollection.Tasks + "/{task_id}")
    .onCreate(handlers.taskListItem.onCreate);

export const onLocalTaskItemDelete = functions.firestore
    .document(FirestoreCollection.TaskLists + "/{id}/" + FirestoreCollection.Tasks + "/{task_id}")
    .onDelete(handlers.taskListItem.onDelete);

export const onLocalTaskItemUpdate = functions.firestore
    .document(FirestoreCollection.TaskLists + "/{id}/" + FirestoreCollection.Tasks + "/{task_id}")
    .onUpdate(handlers.taskListItem.onUpdate);

export const onLocalTaskItemWrite = functions.firestore
    .document(FirestoreCollection.TaskLists + "/{id}/" + FirestoreCollection.Tasks + "/{task_id}")
    .onWrite(handlers.taskListItem.onWrite);

export const onCaseToDoPhotosDelete = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.photo.onDelete);

export const onCaseToDoListDelete = functions.firestore
    .document(FirestoreCollection.TaskLists + "/{id}")
    .onDelete(handlers.taskList.onDelete);

export const onShoppingListItemCreate = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}")
    .onCreate(handlers.shoppingListItem.onCreate);

export const onShoppingListItemDelete = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}")
    .onDelete(handlers.shoppingListItem.onDelete);

export const onShoppingListItemDUpdate = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}")
    .onUpdate(handlers.shoppingListItem.onUpdate);

export const onShoppingListItemPhotosDelete = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.photo.onDelete);

export const onShoppingListDelete = functions.firestore
    .document(FirestoreCollection.BuyLists + "/{id}")
    .onDelete(handlers.shoppingList.onDelete);

export const onRoomDelete = functions.firestore
    .document(FirestoreCollection.Rooms + "/{id}")
    .onDelete(handlers.room.onDelete);

export const onRoomCreate = functions.firestore
    .document(FirestoreCollection.Rooms + "/{id}")
    .onCreate(handlers.room.onCreate);

export const onRoomUpdate = functions.firestore
    .document(FirestoreCollection.Rooms + "/{id}")
    .onUpdate(handlers.room.onUpdate);

export const onRoomPhotosDelete = functions.firestore
    .document(FirestoreCollection.Rooms + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.photo.onDelete);

export const onHousingDelete = functions.firestore
    .document(FirestoreCollection.Housings + "/{id}")
    .onDelete(handlers.housing.onDelete);

export const onHousingPhotosDelete = functions.firestore
    .document(FirestoreCollection.Housings + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.photo.onDelete);

export const sendingMessages = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(schedule.sendingMessageScheduleFunction);
