import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {Change} from "firebase-functions";
import {Functions} from "../Functions";

export class CalendarEventHandlers {
    // ON CREATE METHODS
    async copyToLocalCollection(snapshot: DocumentSnapshot) {
        return Functions.calendarEvent().copyToLocalCollections(snapshot).commit()
    }
    async createGoogleCalendarEvent(snapshot: DocumentSnapshot) {
        return Functions.calendarEvent().create(snapshot)
    }
    // ON DELETE METHODS
    async deleteFromLocalCollection(snapshot: DocumentSnapshot) {
        return Functions.calendarEvent().deleteFormLocalCollections(snapshot).commit()
    }
    async deleteGoogleCalendarEvent(snapshot: DocumentSnapshot) {
        return Functions.calendarEvent().delete(snapshot)
    }
    // ON UPDATE METHODS
    async updateInLocalCollection(change: Change<DocumentSnapshot>) {
        return Functions.calendarEvent().copyToLocalCollections(change.after).commit()
    }
    async updateGoogleCalendarEvent(change: Change<DocumentSnapshot>) {
        return Functions.calendarEvent().update(change.after)
    }
}
