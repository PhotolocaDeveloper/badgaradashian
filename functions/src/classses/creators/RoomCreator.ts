import {RoomBuilder} from "../abstract/RoomBuilder";
import {Room} from "../model/Room";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {serialize} from "typescript-json-serializer";
import WriteBatch = admin.firestore.WriteBatch;
import DocumentReference = admin.firestore.DocumentReference;

export class RoomCreator {

    constructor(
        private builder: RoomBuilder
    ) {
    }

    get room(): Room | undefined {
        return this.builder.get()
    }

    create(): RoomCreator {
        this.builder.buildName();
        this.builder.buildDescription();
        this.builder.buildUser();
        this.builder.buildDateCreated();
        this.builder.buildPhotos();
        this.builder.buildHousing();
        this.builder.build();
        return this;
    }

    getSaveBatch(_batch?: WriteBatch, _ref?: DocumentReference): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const ref = _ref || admin.firestore().collection(FirestoreCollection.Rooms).doc();
        const room = this.room;
        if (!room) return batch;
        const data = serialize(this.room);
        const photos = room.photos || [];
        batch.set(ref, data);
        photos.forEach(photo => {
            const photoRef = ref.collection(FirestoreCollection.Photos).doc();
            const photoData = serialize(photo);
            batch.set(photoRef, photoData);
        });
        return batch;
    }
}
