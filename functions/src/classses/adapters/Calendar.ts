import {calendar_v3, google} from 'googleapis';
import {IBSyncUserSettings} from "../builders/indetefires/IBSyncUserSettings";
import {IdentifierCreator} from "../creators/IdentifierCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {UserSettingSynchronization} from "../model/UserSettingSynchronization";
import {OAuth2Client} from 'googleapis-common';
import * as credentials from '../../credetials.json'
import Schema$Event = calendar_v3.Schema$Event;
import {Helper} from "../helpers/Helper";


export class Calendar implements CalendarFunctions$EventDelegate {

    private static instance?: Calendar;
    private oauth2Client = new google.auth.OAuth2({
        clientId: credentials.web.client_id,
        clientSecret: credentials.web.client_secret,
        redirectUri: credentials.web.redirect_uris[2]
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
        return Helper.firestore().deserialize(snapshot, UserSettingSynchronization)
    }

    async generateAuthUrl(uid: string) {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            state: uid,
            scope: ['https://www.googleapis.com/auth/calendar']
        })
    }

    async getOAuth2Client(uid: string): Promise<OAuth2Client | undefined> {
        const settings = await Calendar.getSyncSettings(uid);
        if (!settings) return undefined;
        const tokens = settings.tokens;
        if (!tokens || !settings.isSynchronizationOn) return undefined;
        this.oauth2Client.setCredentials(tokens);
        return this.oauth2Client;
    }

    async refreshOAuth2Tokens(uid: string, code: string) {
        const {tokens} = await this.oauth2Client.getToken(code);
        const settingDocumentRef = Calendar.getSyncSettingsRef(uid);
        return settingDocumentRef.update({tokens: tokens})
    }
}

class CalendarFunctions$Event {

    constructor(private calendar: calendar_v3.Calendar, private delegate: CalendarFunctions$EventDelegate) {
    }

    async insert(uid: string, event: Schema$Event) {
        const oauth2Client = await this.delegate.getOAuth2Client(uid);
        if (!oauth2Client) return Promise.resolve();
        return this.calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            requestBody: event
        })
    }

    async update(uid: string, eventId: string, event: Schema$Event) {
        const oauth2Client = await this.delegate.getOAuth2Client(uid);
        if (!oauth2Client) return Promise.resolve();
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
