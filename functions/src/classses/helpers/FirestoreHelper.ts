import * as admin from "firebase-admin";

export class FirestoreHelper {

    deleteAllFilesInQuery(querySnapshot: admin.firestore.QuerySnapshot): Promise<any> {
        return Promise.all(querySnapshot.docs.map(document => document.ref.delete()));
    }

}
