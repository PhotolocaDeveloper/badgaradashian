import {calendar_v3, google} from 'googleapis';
import {IBSyncUserSettings} from "../builders/indetefires/IBSyncUserSettings";
import {IdentifierCreator} from "../creators/IdentifierCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {deserialize} from "typescript-json-serializer";
import {UserSettingSynchronization} from "../model/UserSettingSynchronization";
import {OAuth2Client} from 'googleapis-common';
import {GoogleAuth} from 'google-auth-library';
import Schema$Event = calendar_v3.Schema$Event;


export class Calendar implements CalendarFunctions$EventDelegate {

    private static instance?: Calendar;
    readonly auth: GoogleAuth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/calendar']
    });
    event: CalendarFunctions$Event;

    private constructor() {
        this.event = new CalendarFunctions$Event(google.calendar({version: 'v3'}), this)
    }

    static getInstance(): Calendar {
        if (!Calendar.instance) {
            Calendar.instance = new Calendar();
        }
        return Calendar.instance
    }

    private static getSyncSettingsRef(uid: string) {
        const userSyncSettingIB = new IBSyncUserSettings(uid);
        const ic = new IdentifierCreator(userSyncSettingIB);
        const userSycSettingId = ic.construct().get();
        return admin.firestore().collection(FirestoreCollection.UserSettings).doc(userSycSettingId);
    }

    private static async getSyncSettings(uid: string) {
        const ref = Calendar.getSyncSettingsRef(uid);
        const snapshot = await ref.get();
        return deserialize(snapshot.data(), UserSettingSynchronization)
    }

    async generateAuthUrl(uid: string) {
        const authClient = await this.auth.getClient();
        return authClient.generateAuthUrl({
            access_type: 'offline',
            state: uid
        })
    }

    async getOAuth2Client(uid: string): Promise<OAuth2Client | undefined> {
        const settings = await Calendar.getSyncSettings(uid);
        const tokens = settings.tokens;
        if (!tokens) return undefined;
        const oauth2Client = await this.auth.getClient();
        oauth2Client.setCredentials(tokens);
        return oauth2Client;
    }

    async refreshOAuth2Tokens(uid: string, code: string) {
        const oauth2Client = await this.auth.getClient();
        const {tokens} = await oauth2Client.getToken(code);
        const settingDocumentRef = Calendar.getSyncSettingsRef(uid);
        return settingDocumentRef.update({tokens: tokens})
    }
}

class CalendarFunctions$Event {

    constructor(private calendar: calendar_v3.Calendar, private delegate: CalendarFunctions$EventDelegate) {
    }

    async insert(uid: string, event: Schema$Event) {
        const oauth2Client = await this.delegate.getOAuth2Client(uid);
        return this.calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            requestBody: event
        })
    }

    async update(uid: string, eventId: string, event: Schema$Event) {
        const oauth2Client = await this.delegate.getOAuth2Client(uid);
        return this.calendar.events.update({
            auth: oauth2Client,
            calendarId: 'primary',
            eventId: eventId,
            requestBody: event
        })
    }

    async delete(uid: string, eventId: string) {
        const oauth2Client = await this.delegate.getOAuth2Client(uid);
        return this.calendar.events.delete({
            auth: oauth2Client,
            calendarId: 'primary',
            eventId: eventId
        })
    }

    async list(uid: string) {
        const oauth2Client = await this.delegate.getOAuth2Client(uid);
        return this.calendar.events.list({
            auth: oauth2Client,
            calendarId: 'primary'
        });
    }
}

interface CalendarFunctions$EventDelegate {
    getOAuth2Client(uid: string): Promise<OAuth2Client | undefined>
}
