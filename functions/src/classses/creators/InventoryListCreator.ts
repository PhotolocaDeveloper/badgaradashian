import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {serialize} from "typescript-json-serializer";
import {InventoryList} from "../model/InventoryList";
import {InventoryListBuilder} from "../abstract/InventoryListBuilder";
import WriteBatch = admin.firestore.WriteBatch;
import DocumentReference = admin.firestore.DocumentReference;

export class InventoryListCreator {

    constructor(
        private builder: InventoryListBuilder
    ) {
    }

    get item(): InventoryList | undefined {
        return this.builder.get()
    }

    create(): InventoryListCreator {
        this.builder.buildName();
        this.builder.buildDescription();
        this.builder.buildIcon();
        this.builder.buildUser();
        this.builder.buildRoom();
        this.builder.buildHousing();
        this.builder.buildDateCreation();
        this.builder.build();
        return this;
    }

    createBatch(_batch?: WriteBatch, _ref?: DocumentReference): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const ref = _ref || admin.firestore().collection(FirestoreCollection.InventoryLists).doc();
        const item = this.item;
        if (!item) return batch;
        const data = serialize(item);
        batch.set(ref, data);
        return batch;
    }
}
