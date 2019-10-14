import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";

export class CalendarEventHandlers {

    onCreate(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.calendarEvent().copyToLocalCollections(snapshot).commit(),
            Functions.calendarEvent().create(snapshot)
        ])
    }

    onDelete(snapshot: DocumentSnapshot): Promise<any> {
        return Promise.all([
            Functions.calendarEvent().deleteFormLocalCollections(snapshot).commit(),
            Functions.calendarEvent().delete(snapshot)
        ])
    }

    onUpdate(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            Functions.calendarEvent().copyToLocalCollections(change.after).commit(),
            Functions.calendarEvent().update(change.after)
        ])
    }
}
