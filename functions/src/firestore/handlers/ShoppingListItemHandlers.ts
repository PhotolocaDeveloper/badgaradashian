import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {deserialize} from "typescript-json-serializer";
import {ShoppingListItem} from "../../classses/model/ShoppingListItem";

export class ShoppingListItemHandlers {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.shopping().createOnShoppingListItemNeedToBuy(snapshot),
            Functions.shopping().incrementShoppingItemsInListCount(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().deleteRelatedNotifications(snapshot),
            Functions.general().deleteRelatedPhotos(snapshot),
            Functions.shopping().decrementShoppingItemsInListCount(snapshot)
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const caseToDoBefore = deserialize(change.before, ShoppingListItem);
        const caseToDoAfter = deserialize(change.after, ShoppingListItem);

        const promises: Promise<any>[] = [
            Functions.shopping().updateShoppingListItemInListCount(change.before, change.after)
        ];

        if (caseToDoAfter.dateToBuy !== caseToDoBefore.dateToBuy) {
            promises.concat([
                Functions.general().deleteRelatedNotifications(change.before),
                Functions.shopping().createOnShoppingListItemNeedToBuy(change.after)
            ])
        }

        return Promise.all(promises)
    }
}
