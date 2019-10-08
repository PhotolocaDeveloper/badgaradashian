import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {deserialize} from "typescript-json-serializer";
import {ShoppingListItem} from "../../classses/model/ShoppingListItem";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";

export class ShoppingListItemHandlers {

    private static LIST_FIELD = new admin.firestore.FieldPath("list");
    private static HOUSING_FIELD = new admin.firestore.FieldPath("object");

    private static COLLECTION_NAME = FirestoreCollection.TaskLists;

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.shopping().createOnShoppingListItemNeedToBuy(snapshot),
            Functions.general()
                .copyToLocalCollection(
                    snapshot,
                    ShoppingListItemHandlers.LIST_FIELD,
                    ShoppingListItemHandlers.COLLECTION_NAME).commit(),
            Functions.general()
                .copyToLocalCollection(
                    snapshot,
                    ShoppingListItemHandlers.HOUSING_FIELD,
                    ShoppingListItemHandlers.COLLECTION_NAME)
                .commit()
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().deleteRelatedNotifications(snapshot),
            Functions.general().deleteRelatedPhotos(snapshot),
            Functions.general().removeFormLocalCollection(
                snapshot,
                ShoppingListItemHandlers.LIST_FIELD,
                ShoppingListItemHandlers.COLLECTION_NAME).commit(),
            Functions.general()
                .removeFormLocalCollection(
                    snapshot,
                    ShoppingListItemHandlers.HOUSING_FIELD,
                    ShoppingListItemHandlers.COLLECTION_NAME)
                .commit()
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const caseToDoBefore = deserialize(change.before.data(), ShoppingListItem);
        const caseToDoAfter = deserialize(change.after.data(), ShoppingListItem);

        const promises: Promise<any>[] = [
            Functions.general().updateAtLocalCollection(
                change,
                ShoppingListItemHandlers.LIST_FIELD,
                ShoppingListItemHandlers.COLLECTION_NAME)
                .commit(),
            Functions
                .general()
                .updateAtLocalCollection(
                    change,
                    ShoppingListItemHandlers.HOUSING_FIELD,
                    ShoppingListItemHandlers.COLLECTION_NAME)
                .commit()
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
