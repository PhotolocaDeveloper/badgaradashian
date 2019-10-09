import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";
import {Change} from "firebase-functions";
import * as admin from "firebase-admin";
import FieldPath = admin.firestore.FieldPath;

export class ShoppingItemLocalHandlers {

    private static ITEMS_COUNT_FIELD = new FieldPath("items_count");

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        const batch = Functions.shopping().incrementCompetedInListCount(snapshot);
        return Functions.general()
            .updateCountInParentCollection(snapshot, ShoppingItemLocalHandlers.ITEMS_COUNT_FIELD, 1, batch).commit();

    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        const batch = Functions.shopping().decrementCompetedInListCount(snapshot);
        return Functions.general()
            .updateCountInParentCollection(snapshot, ShoppingItemLocalHandlers.ITEMS_COUNT_FIELD, -1, batch)
            .commit()
    }

    onWrite(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.shopping().updateMaxDateToDo(change.after),
            Functions.shopping().updateCompletedTaskInListCount(change).commit()
        ]);
    }
}
