import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";
import {ShoppingListItem} from "../../classses/model/ShoppingListItem";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {ShoppingList} from "../../classses/model/ShoppingList";
import FieldPath = admin.firestore.FieldPath;
import {Helper} from "../../classses/helpers/Helper";

export class ShoppingListItemHandlers {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.shopping().createOnShoppingListItemNeedToBuy(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().deleteRelatedNotifications(snapshot),
            Functions.general().deleteRelatedPhotos(snapshot)
        ]);
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const caseToDoBefore = Helper.firestore().deserialize(change.before, ShoppingListItem);
        const caseToDoAfter = Helper.firestore().deserialize(change.after, ShoppingListItem);

        const promises: Promise<any>[] = [];

        if (caseToDoAfter?.dateToBuy !== caseToDoBefore?.dateToBuy) {
            promises.concat([
                Functions.general().deleteRelatedNotifications(change.before),
                Functions.shopping().createOnShoppingListItemNeedToBuy(change.after)
            ])
        }

        return Promise.all(promises)
    }

    updateCounters(change: Change<DocumentSnapshot>): Promise<any> {

        // Update tasks count in task list if needed
        const batch = Functions.shopping()
            .updateCountInRelativeObject(
                change,
                ShoppingListItem.Fields.LIST,
                ShoppingList.Fields.ITEMS_COUNT,
                item => {
                    return item.list
                });

        // Move one done task to another list if list changed and task done state doesn't changed
        Functions.shopping()
            .updateCompletionCountWhenRelativeObjectChanged(
                change,
                ShoppingListItem.Fields.LIST,
                ShoppingList.Fields.DONE_ITEMS_COUNT,
                item => {
                    return item.list
                },
                batch);

        // Update completed task count in related task list if needed
        Functions.shopping()
            .updateCompletionCountInRelativeObject(
                change,
                ShoppingListItem.Fields.LIST,
                ShoppingList.Fields.DONE_ITEMS_COUNT,
                batch);


        return Promise.all([
            batch.commit()
        ]).catch(res => {
            console.error(res.toLocaleString());
            return this.updateCounters(change)
        })
    }

    incrementCounters(snapshot: DocumentSnapshot): Promise<any> {
        // Incrementing task counts in tasks list
        const listUpdateBatch = Functions.countable()
            .update(ShoppingListItem, snapshot, ShoppingListItem.Fields.LIST, ShoppingList.Fields.ITEMS_COUNT)
            .increment();

        // Increment completed task count in task list if needed
        Functions.countable().update(ShoppingListItem, snapshot, ShoppingListItem.Fields.LIST, ShoppingList.Fields.DONE_ITEMS_COUNT)
            .setBatch(listUpdateBatch)
            .setCondition(value => {
                return value.isDone === true
            })
            .increment();

        return Promise.all([
            listUpdateBatch.commit()
        ]).catch(res => {
            console.error(res);
            return this.incrementCounters(snapshot)
        })
    }

    decrementCounters(snapshot: DocumentSnapshot): Promise<any> {
        // Decrement task count in task list
        const listUpdateBatch = Functions.countable()
            .update(ShoppingListItem, snapshot, ShoppingListItem.Fields.LIST, ShoppingList.Fields.ITEMS_COUNT)
            .decrement();

        // Decrement completed task count in task list if needed
        Functions.countable()
            .update(ShoppingListItem, snapshot, ShoppingListItem.Fields.LIST, ShoppingList.Fields.DONE_ITEMS_COUNT)
            .setBatch(listUpdateBatch)
            .setCondition(value => {
                return value.isDone === true
            })
            .decrement();

        return Promise.all([
            listUpdateBatch.commit()
        ]).catch(res => {
            console.error(res);
            return this.decrementCounters(snapshot);
        })
    }

    copyToLocalCollection(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general()
                .copyToLocalCollection(snapshot, new FieldPath(ShoppingListItem.Fields.LIST), FirestoreCollection.Buys)
                .commit(),
            Functions.general()
                .copyToLocalCollection(snapshot, new FieldPath(ShoppingListItem.Fields.OBJECT), FirestoreCollection.Buys)
                .commit(),
        ]);

    }

    removeFromLocalCollection(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general()
                .removeFormLocalCollection(snapshot, new FieldPath(ShoppingListItem.Fields.LIST), FirestoreCollection.Buys)
                .commit(),
            Functions.general()
                .removeFormLocalCollection(snapshot, new FieldPath(ShoppingListItem.Fields.OBJECT), FirestoreCollection.Buys)
                .commit(),
        ]);
    }

    updateOnLocalCollection(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.general()
                .updateAtLocalCollection(change, new FieldPath(ShoppingListItem.Fields.LIST), FirestoreCollection.Buys)
                .commit(),
            Functions.general()
                .updateAtLocalCollection(change, new FieldPath(ShoppingListItem.Fields.OBJECT), FirestoreCollection.Buys)
                .commit(),
        ]);
    }
}
