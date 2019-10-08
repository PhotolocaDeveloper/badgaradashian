import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {deserialize} from "typescript-json-serializer";
import {Inventory} from "../../classses/model/Inventory";

export class InventoryHandlers {
    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.inventory().createOnInventoryEndsNotification(snapshot),
            Functions.inventory().createShoppingListItem(snapshot),
            Functions.inventory().incrementCountInParentObjects(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().deleteRelatedNotifications(snapshot),
            Functions.general().deleteRelatedPhotos(snapshot),
            Functions.inventory().deleteRelatedShoppingListItems(snapshot),
            Functions.inventory().decrementCountInParentObjects(snapshot)
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const inventoryBefore = deserialize(change.before.data(), Inventory);
        const inventoryAfter = deserialize(change.after.data(), Inventory);

        const promises: Promise<any>[] = [
            Functions.inventory().updateInventoryInListCount(change.before, change.after)
        ];

        if (inventoryAfter.nextReplacementDate !== inventoryBefore.nextReplacementDate) {
            promises.concat([
                Functions.general().deleteRelatedNotifications(change.before),
                Functions.inventory().deleteRelatedShoppingListItems(change.before),
                Functions.inventory().createOnInventoryEndsNotification(change.after),
                Functions.inventory().createShoppingListItem(change.after)
            ])
        }

        return Promise.all(promises)
    }
}
