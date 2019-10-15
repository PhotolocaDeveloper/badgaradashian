import {ShoppingListBuilder} from "../abstract/ShoppingListBuilder";
import {ShoppingList} from "../model/ShoppingList";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {serialize} from "typescript-json-serializer";
import WriteBatch = admin.firestore.WriteBatch;
import DocumentReference = admin.firestore.DocumentReference;

export class ShoppingListCreator {

    constructor(
        private builder: ShoppingListBuilder
    ) {
    }

    get item(): ShoppingList | undefined {
        return this.builder.get()
    }

    create(): ShoppingListCreator {
        this.builder.buildName();
        this.builder.buildUser();
        this.builder.buildIsHidden();
        this.builder.build();
        return this;
    }

    createBatch(_batch?: WriteBatch, _ref?: DocumentReference): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const ref = _ref || admin.firestore().collection(FirestoreCollection.BuyLists).doc();
        const item = this.item;
        if (!item) return batch;
        const data = serialize(item);
        batch.set(ref, data);
        return batch;
    }
}
