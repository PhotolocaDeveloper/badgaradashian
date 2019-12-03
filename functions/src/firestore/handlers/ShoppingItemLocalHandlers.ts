import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";
import {Change} from "firebase-functions";

export class ShoppingItemLocalHandlers {

    onWrite(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.shopping().updateMaxDateToDo(change.after)
        ]);
    }
}
