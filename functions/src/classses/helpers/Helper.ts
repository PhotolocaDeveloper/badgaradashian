import {FirestoreHelper} from "./FirestoreHelper";
import {DateHelper} from "./DateHelper";

export class Helper {

    private static firestoreHelper: FirestoreHelper;
    private static dateHelper: DateHelper;

    static firestore(): FirestoreHelper {
        if (!Helper.firestoreHelper) {
            Helper.firestoreHelper = new FirestoreHelper();
        }
        return Helper.firestoreHelper;
    }

    static date(): DateHelper {
        if (!Helper.dateHelper) {
            Helper.dateHelper = new DateHelper();
        }
        return Helper.dateHelper;
    }

}
