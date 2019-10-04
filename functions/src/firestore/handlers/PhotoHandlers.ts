import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
// import {Change} from "firebase-functions";
import {deserialize} from "typescript-json-serializer";
import {Photo} from "../../classses/model/Photo";
import * as admin from "firebase-admin";

export class PhotoHandlers {
    // onCreate(snapshot: DocumentSnapshot): Promise<any> {
    // }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        const photo = deserialize(snapshot.data(), Photo);
        if (photo.path === undefined) return Promise.resolve();
        return admin.storage().bucket().file(photo.path).delete();
    }

    // onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
    // }
}
