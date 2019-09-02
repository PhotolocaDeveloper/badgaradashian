import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {EventContext} from "firebase-functions";
import {deserialize, serialize} from "typescript-json-serializer";
import {CaseToDo} from "../classses/model/CaseToDo";
import {CaseToDoNotifBuilder} from "../classses/builders/notifications/CaseToDoNotifBuilder";
import {NotificationCreator} from "../classses/creators/NotificationCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";

export namespace CaseToDoFunctions {

    /**
     * Создаёт уведомление о необходимости выоплнить запланированное дело
     * @param snapshot
     * @param context
     */
    export function createOnToDoCaseNotification(snapshot: DocumentSnapshot, context: EventContext): Promise<any> | undefined {
        if (context.auth === undefined) return;

        const caseToDo = deserialize(snapshot.data(), CaseToDo);
        const uid = context.auth.uid;

        const notificationBuilder = new CaseToDoNotifBuilder(uid, snapshot.ref, caseToDo);
        const notificationCreator = new NotificationCreator(notificationBuilder);

        const notification = notificationCreator.construct().get();

        return admin.firestore().collection(FirestoreCollection.Notifications).doc().create(serialize(notification));
    }


}
