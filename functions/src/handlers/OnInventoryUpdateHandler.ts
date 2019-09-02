import {Change, EventContext} from "firebase-functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize} from "typescript-json-serializer";
import {Inventory} from "../classses/model/Inventory";
import {InventoryFunctions} from "../firestore/InventoryFunctions";

/**
 * Обновляет уведомление о необходимости замены инвентаря и связанные покупки, если изменена дата следующей замены
 * @param change
 * @param context
 */
export function onInventoryUpdateHandler(change: Change<DocumentSnapshot>, context: EventContext): Promise<any> | undefined {
    const inventoryBefore = deserialize(change.before.data(), Inventory);
    const inventoryAfter = deserialize(change.after.data(), Inventory);

    if (inventoryAfter.nextReplacementDate != inventoryBefore.nextReplacementDate) {
        return Promise.all([
            InventoryFunctions.deleteRelatedShoppingListItems(change.before, context),
            InventoryFunctions.deleteRelatedNotifications(change.before, context),
            InventoryFunctions.createOnInventoryEndsNotification(change.after, context),
            InventoryFunctions.createShoppingListItem(change.after, context),
        ])
    }

    return undefined
}
