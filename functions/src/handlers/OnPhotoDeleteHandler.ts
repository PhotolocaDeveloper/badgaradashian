import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {deserialize} from "typescript-json-serializer";
import {Photo} from "../classses/model/Photo";

/**
 * Удаляет фотографии из хранилища при удалении ссылки на неё
 * @param snapshot
 */
export function onPhotoDeleteHandler(snapshot: DocumentSnapshot) {
    const photo = deserialize(snapshot.data(), Photo);
    if (photo.path === undefined) return Promise.resolve();
    return admin.storage().bucket().file(photo.path).delete();
}
