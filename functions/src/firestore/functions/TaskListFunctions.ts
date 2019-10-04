import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";

export class TaskListFunctions {

    deleteSubTasks(snapshot: DocumentSnapshot) {
        return admin.firestore()
            .collection(FirestoreCollection.Tasks)
            .where("list", "==", snapshot.ref)
            .get()
            .then(Helper.firestore().deleteAllFilesInQuery)
    }

}
