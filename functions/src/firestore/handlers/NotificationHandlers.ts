import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Functions} from "../Functions";
import {Change} from "firebase-functions";

export class NotificationHandlers {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Functions.notification().addToSchedule(snapshot).commit();
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Functions.notification().removeFormSchedule(snapshot).commit();
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        const batch = Functions.notification().removeFormSchedule(change.before);
        return Functions.notification().addToSchedule(change.after, batch).commit();
    }

}
