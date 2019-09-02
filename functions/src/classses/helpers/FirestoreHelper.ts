import * as admin from "firebase-admin";

export namespace FirestoreHelper {

    export function deleteAllFilesInQuery(querySnapshot: admin.firestore.QuerySnapshot): Promise<any> {
        return Promise.all(querySnapshot.docs.map(document => document.ref.delete()));
    }

}
