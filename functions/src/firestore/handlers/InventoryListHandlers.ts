import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";

export class InventoryListHandlers {
    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.inventoryList().incrementInventoryListsInRoomCount(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.inventoryList().deleteInventoryListItems(snapshot),
            Functions.inventoryList().decrementInventoryListsInRoomCount(snapshot)
        ])
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.inventoryList().updateInventoryListInRoomCount(change.before, change.after),
            Functions.inventoryList().updateInventoryInRoomCount(change.before, change.after)
        ])
    }
}
