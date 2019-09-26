import {Change, EventContext} from "firebase-functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize} from "typescript-json-serializer";
import {Functions} from "../firestore/Functions";
import {ShoppingListItem} from "../classses/model/ShoppingListItem";

export function onShoppingListItemUpdateHandler(change: Change<DocumentSnapshot>, context: EventContext) {
    const caseToDoBefore = deserialize(change.before, ShoppingListItem);
    const caseToDoAfter = deserialize(change.after, ShoppingListItem);

    if (caseToDoAfter.dateToBuy !== caseToDoBefore.dateToBuy) {
        return Promise.all([
            Functions.general().deleteRelatedNotifications(change.before, context),
            Functions.shopping().createOnShoppingListItemNeedToBuy(change.after, context)
        ])
    }

    return undefined
}