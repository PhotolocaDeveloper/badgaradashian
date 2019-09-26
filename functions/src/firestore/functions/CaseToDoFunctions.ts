import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize, serialize} from "typescript-json-serializer";
import {CaseToDo} from "../../classses/model/CaseToDo";
import {CaseToDoNotifBuilder} from "../../classses/builders/notifications/CaseToDoNotifBuilder";
import {NotificationCreator} from "../../classses/creators/NotificationCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";

export class CaseToDoFunctions {

    deleteToDoCasesInList(snapshot: DocumentSnapshot) {
        return admin.firestore()
            .collection(FirestoreCollection.Tasks)
            .where("list", "==", snapshot.ref)
            .get()
            .then(Helper.firestore().deleteAllFilesInQuery)
    }

    /**
     * Создаёт уведомление о необходимости выоплнить запланированное дело
     * @param snapshot
     */
    createOnToDoCaseNotification(snapshot: DocumentSnapshot): Promise<any> | undefined {
        const caseToDo = deserialize(snapshot.data(), CaseToDo);
        const uid = caseToDo.user.id;

        const notificationBuilder = new CaseToDoNotifBuilder(uid, snapshot.ref, caseToDo);
        const notificationCreator = new NotificationCreator(notificationBuilder);

        const notification = notificationCreator.construct().get();

        return admin.firestore().collection(FirestoreCollection.Notifications).doc().create(serialize(notification));
    }


}
