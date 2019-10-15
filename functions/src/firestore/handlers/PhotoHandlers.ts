import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize} from "typescript-json-serializer";
import {Photo} from "../../classses/model/Photo";
import * as admin from "firebase-admin";
import {Functions} from "../Functions";
import FieldPath = admin.firestore.FieldPath;

export class PhotoHandlers {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.general().updateCountInParentCollection(snapshot, new FieldPath("photos_count"), 1).commit()
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        const promises: Promise<any>[] = [];
        const photo = deserialize(snapshot.data(), Photo);
        if (photo.path !== undefined) {
            promises.concat([
                admin.storage().bucket().file(photo.path).delete()
            ])
        }
        promises.concat([
            Functions.general().updateCountInParentCollection(snapshot, new FieldPath("photos_count"), -1).commit()
        ]);
        return Promise.all(promises);
    }
}
