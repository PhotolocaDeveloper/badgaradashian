import {Calendar} from "../../classses/adapters/Calendar";

export class CalendarHttpsHandles {

    private static calendar = Calendar.getInstance();

    generateAuthUrl(uid: string) {
        return CalendarHttpsHandles.calendar.generateAuthUrl(uid)
    }

    async calendarOAuth(uid: string, code: string) {
        return CalendarHttpsHandles.calendar.refreshOAuth2Tokens(uid, code)
    }
}
