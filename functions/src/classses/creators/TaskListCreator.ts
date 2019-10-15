import {TaskListBuilder} from "../builders/taskList/TaskListBuilder";
import {TaskList} from "../model/TaskList";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {serialize} from "typescript-json-serializer";
import WriteBatch = admin.firestore.WriteBatch;
import DocumentReference = admin.firestore.DocumentReference;

export class TaskListCreator {

    constructor(
        private builder: TaskListBuilder
    ) {
    }

    get list(): TaskList | undefined {
        return this.builder.get()
    }

    create(): TaskListCreator {
        this.builder.buildName();
        this.builder.buildIcon();
        this.builder.buildUser();
        this.builder.buildDateCreated();
        this.builder.build();
        return this;
    }

    createBatch(_batch?: WriteBatch, _ref?: DocumentReference): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const ref = _ref || admin.firestore().collection(FirestoreCollection.TaskLists).doc();
        const item = this.list;
        if (!item) return batch;
        const data = serialize(item);
        batch.set(ref, data);
        return batch;
    }
}
