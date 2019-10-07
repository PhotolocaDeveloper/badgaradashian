import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";

export class TaskListFunctions {

    deleteSubTasks(snapshot: DocumentSnapshot) {
        const query = admin.firestore()
            .collection(FirestoreCollection.Tasks)
            .where("list", "==", snapshot.ref);
        return Helper.firestore().deleteAllFilesInQuery(query)
    }

}
