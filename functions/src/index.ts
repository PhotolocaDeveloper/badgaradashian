import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as schedule from "./scheduleFunctions"
import * as handlers from './firestore/Handlers'
import * as https from './firestore/HttpsHandlers'
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

export const onInventoryPhotosCreate = functions.firestore
    .document(FirestoreCollection.Inventories + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onCreate(handlers.photo.onCreate);

export const onInventoryListDelete = functions.firestore
    .document(FirestoreCollection.InventoryLists + "/{id}")
    .onDelete(handlers.inventoryList.onDelete);

export const onInventoryListCreate = functions.firestore
    .document(FirestoreCollection.InventoryLists + "/{id}")
    .onCreate(handlers.inventoryList.onCreate);

export const onInventoryListUpdate = functions.firestore
    .document(FirestoreCollection.InventoryLists + "/{id}")
    .onUpdate(handlers.inventoryList.onUpdate);

/***
 * TASK FUNCTIONS
 * - onCaseToDoCreate
 * - taskCopyToLocalCollection
 * - taskIncrementCounters
 * - onCaseToDoDelete
 * - taskDeleteFromLocalCollection
 * - taskDecrementCounters
 * - onCaseToDoUpdate
 * - updateTaskCounters
 * - updateTaskInLocalCollection
 * - taskUpdateNextIterationDateAndCheckerState
 * - onLocalTaskItemWrite
 * - onCaseToDoPhotosDelete
 * - onCaseToDoPhotosCreate
 * - onCaseToDoListDelete
 */

/**
 *  Task create handler:
 *  - Create notification
 *  - Create calendar event
 */
export const onCaseToDoCreate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onCreate(handlers.task.onCreate);

/**
 * Copy task to local collection
 */
export const taskCopyToLocalCollection = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onCreate(handlers.task.copyToLocalCollection);

/**
 * Increment counters in relative task list and housing:
 *  - Increment task count in housing
 *  - Increment task count in task list
 *  - Increment completed task count in task list if needed
 *  - Increment completed task count in housing if needed
 */
export const taskIncrementCounters = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onCreate(handlers.task.incrementTaskCounters);

/**
 * Task delete handler:
 *  - Deleting related photos
 *  - Deleting related calendar events
 */
export const onCaseToDoDelete = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onDelete(handlers.task.onDelete);

/**
 * Delete task from local collection
 */
export const taskDeleteFromLocalCollection = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onDelete(handlers.task.removeFromLocalCollection);

/**
 * Decrement counters in relative task list and housing:
 *  - Decrement task count in task list
 *  - Decrement completed task count in task list if needed
 *  - Decrement task count in housing
 *  - Decrement completed task count in housing if needed
 */
export const taskDecrementCounters = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onDelete(handlers.task.decrementTaskCounters);

/**
 * Task update handler:
 *  - Update related notification if `nextRepetitionDate` was changed
 *  - Update calendar event
 */
export const onCaseToDoUpdate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onUpdate(handlers.task.onUpdate);

/**
 * Updated task counters if needed:
 *  - Update tasks count in task list if needed
 *  - Update completed task count in related task list if needed
 *  - Update tasks count in related housing
 *  - Update completed tasks count in related housing if needed
 */
export const updateTaskCounters = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onUpdate(handlers.task.updateTaskCounters);

/**
 * Updated task in local collection if needed
 */
export const updateTaskInLocalCollection = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onUpdate(handlers.task.updateInLocalCollection);

export const taskUpdateNextIterationDateAndCheckerState = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}")
    .onUpdate(handlers.task.updateNextIterationTime);

/**
 * Handle write to task list sub collection with tasks:
 *  - Update date_to_do in task list
 */
export const onLocalTaskItemWrite = functions.firestore
    .document(FirestoreCollection.TaskLists + "/{id}/" + FirestoreCollection.Tasks + "/{task_id}")
    .onWrite(handlers.taskListItem.onWrite);

export const onCaseToDoPhotosDelete = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.photo.onDelete);

export const onCaseToDoPhotosCreate = functions.firestore
    .document(FirestoreCollection.Tasks + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onCreate(handlers.photo.onCreate);

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

export const onShoppingListItemPhotosCreate = functions.firestore
    .document(FirestoreCollection.Buys + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onCreate(handlers.photo.onCreate);

export const onShoppingListDelete = functions.firestore
    .document(FirestoreCollection.BuyLists + "/{id}")
    .onDelete(handlers.shoppingList.onDelete);

export const onLocalShoppingListItemCreate = functions.firestore
    .document(FirestoreCollection.BuyLists + "/{id}/" + FirestoreCollection.Buys + "/{shopping_item_id}")
    .onCreate(handlers.shoppingItemLocal.onCreate);

export const onLocalShoppingListItemDelete = functions.firestore
    .document(FirestoreCollection.BuyLists + "/{id}/" + FirestoreCollection.Buys + "/{shopping_item_id}")
    .onDelete(handlers.shoppingItemLocal.onDelete);

export const onLocalShoppingListItemWrite = functions.firestore
    .document(FirestoreCollection.BuyLists + "/{id}/" + FirestoreCollection.Buys + "/{shopping_item_id}")
    .onWrite(handlers.shoppingItemLocal.onWrite);

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

export const onRoomPhotosCreate = functions.firestore
    .document(FirestoreCollection.Rooms + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onCreate(handlers.photo.onCreate);

export const onHousingDelete = functions.firestore
    .document(FirestoreCollection.Housings + "/{id}")
    .onDelete(handlers.housing.onDelete);

export const onHousingPhotosDelete = functions.firestore
    .document(FirestoreCollection.Housings + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onDelete(handlers.photo.onDelete);

export const onHousingPhotosCreate = functions.firestore
    .document(FirestoreCollection.Housings + "/{id}/" + FirestoreCollection.Photos + "/{photo_id}")
    .onCreate(handlers.photo.onCreate);

export const onNotificationCreate = functions.firestore
    .document(FirestoreCollection.Notifications + "/{id}")
    .onCreate(handlers.notifications.onCreate);

export const onNotificationDelete = functions.firestore
    .document(FirestoreCollection.Notifications + "/{id}")
    .onDelete(handlers.notifications.onDelete);

export const onNotificationUpdate = functions.firestore
    .document(FirestoreCollection.Notifications + "/{id}")
    .onUpdate(handlers.notifications.onUpdate);

export const onCalendarEventCreate = functions.firestore
    .document(FirestoreCollection.CalendarEvents + "/{id}")
    .onCreate(handlers.calendarEvent.onCreate);

export const onCalendarEventDelete = functions.firestore
    .document(FirestoreCollection.CalendarEvents + "/{id}")
    .onDelete(handlers.calendarEvent.onDelete);

export const onCalendarEventUpdate = functions.firestore
    .document(FirestoreCollection.CalendarEvents + "/{id}")
    .onUpdate(handlers.calendarEvent.onUpdate);

export const sendingMessages = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(schedule.sendingMessageScheduleFunction);

export const resettingTaskCompletions = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(schedule.resetTasksCompletion);

export const generateAuthUrl = functions.https.onCall(https.calendar.generateAuthUrl);

export const calendarOAuth = functions.https.onRequest((async (req, resp) => {
    const {code, state} = req.query;
    https.calendar.calendarOAuth(state, code);
    resp.send();
}));
