import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {FirestoreCollection} from "../enums/FirestoreCollection";
import {FirestoreHelper} from "../classses/helpers/FirestoreHelper";
import {InventoryFunctions} from "../firestore/InventoryFunctions";

export function onInventoryDeleteHandler(snapshot: DocumentSnapshot, context: EventContext) {
    return Promise.all([
        InventoryFunctions.deleteRelatedNotifications(snapshot, context),
        InventoryFunctions.deleteRelatedShoppingListItems(snapshot, context),
        deleteRelatedPhotos(snapshot, context)
    ]);
}

/**
 * Удаляет все фотографии добавленные в инвентарь
 * @param snapshot
 * @param context
 */
function deleteRelatedPhotos(snapshot: DocumentSnapshot, context: EventContext): Promise<any> {
    const photosCollection = snapshot.ref.collection(FirestoreCollection.Photos);
    return photosCollection.get().then(FirestoreHelper.deleteAllFilesInQuery)
}
