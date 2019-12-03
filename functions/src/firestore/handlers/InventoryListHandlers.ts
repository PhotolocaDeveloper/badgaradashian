import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";

export class InventoryListHandlers {

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.inventoryList().deleteInventoryListItems(snapshot),
        ])
    }

}
