import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";

export class ShoppingListHandlers {
    // onCreate(snapshot: DocumentSnapshot): Promise<any> {
    // }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.shopping().deleteAllShoppingListItemFromList(snapshot)
        ])
    }

    // onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
    // }
}
