import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {Inventory} from "../../classses/model/Inventory";
import {Helper} from "../../classses/helpers/Helper";

export class InventoryHandlers {
    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.inventory().createOnInventoryEndsNotification(snapshot),
            Functions.inventory().createShoppingListItem(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().deleteRelatedNotifications(snapshot),
            Functions.general().deleteRelatedPhotos(snapshot),
            Functions.inventory().deleteRelatedShoppingListItems(snapshot)
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const inventoryBefore = Helper.firestore().deserialize(change.before, Inventory);
        const inventoryAfter = Helper.firestore().deserialize(change.after, Inventory);

        const promises: Promise<any>[] = [];

        if (inventoryAfter?.nextReplacementDate !== inventoryBefore?.nextReplacementDate) {
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
