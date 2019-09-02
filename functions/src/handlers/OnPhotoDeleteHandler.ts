import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import * as admin from "firebase-admin";
import {deserialize} from "typescript-json-serializer";
import {Photo} from "../classses/model/Photo";

/**
 * Удаляет фотографии из хранилища при удалении ссылки на неё
 * @param snapshot
 * @param context
 */
export function onPhotoDeleteHandler(snapshot: DocumentSnapshot, context: EventContext) {
    const photo = deserialize(snapshot.data(), Photo);
    if (photo === undefined || photo.path === undefined) return;
    return admin.storage().bucket().file(photo.path).delete();
}
