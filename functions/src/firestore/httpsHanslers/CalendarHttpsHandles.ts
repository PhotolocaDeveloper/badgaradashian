import {Calendar} from "../../classses/adapters/Calendar";

export class CalendarHttpsHandles {

    private static calendar = Calendar.getInstance();

    generateAuthUrl(uid: string) {
        return CalendarHttpsHandles.calendar.generateAuthUrl(uid)
    }

    calendarOAuth(uid: string, code: string) {
        CalendarHttpsHandles.calendar.refreshOAuth2Tokens(uid, code).then(() => {
            console.info("Google calendar token successfully updated");
        }).catch(() => {
            console.info("Google calendar token updating failed")
        });

    }
}
