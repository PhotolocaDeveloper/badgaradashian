import {Housing} from "../model/Housing";
import {HousingBuilder} from "../abstract/HousingBuilder";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {serialize} from "typescript-json-serializer";
import WriteBatch = admin.firestore.WriteBatch;
import DocumentReference = admin.firestore.DocumentReference;

export class HousingCreator {

    constructor(
        private builder: HousingBuilder
    ) {
    }

    get housing(): Housing | undefined {
        return this.builder.get()
    }

    getSaveBatch(_batch?: WriteBatch, _ref?: DocumentReference): WriteBatch {
        const batch = _batch || admin.firestore().batch();
        const ref = _ref || admin.firestore().collection(FirestoreCollection.Housings).doc();
        const housing = this.housing;
        if (!housing) return batch;
        const data = serialize(this.housing);
        const photos = housing.photos || [];
        batch.set(ref, data);
        photos.forEach(photo => {
            const photoRef = ref.collection(FirestoreCollection.Photos).doc();
            const photoData = serialize(photo);
            batch.set(photoRef, photoData);
        });
        return batch;
    }

    create(): HousingCreator {
        this.builder.buildName();
        this.builder.buildDescription();
        this.builder.buildUser();
        this.builder.buildDateCreated();
        this.builder.buildPhotos();
        this.builder.build();
        return this;
    }
}
