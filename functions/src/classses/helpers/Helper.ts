import {FirestoreHelper} from "./FirestoreHelper";

export class Helper {

    private static firestoreHelper: FirestoreHelper;

    static firestore(): FirestoreHelper {
        if (!Helper.firestoreHelper) {
            Helper.firestoreHelper = new FirestoreHelper();
        }
        return Helper.firestoreHelper;
    }

}
