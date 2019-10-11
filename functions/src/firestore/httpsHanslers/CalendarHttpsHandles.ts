import {Calendar} from "../../classses/adapters/Calendar";

export class CalendarHttpsHandles {

    private calendar = Calendar.getInstance();

    generateAuthUrl(uid: string) {
        return this.calendar.generateAuthUrl(uid)
    }

    calendarOAuth(uid: string, code: string) {
        this.calendar.refreshOAuth2Tokens(uid, code).then(() => {
            console.info("Google calendar token successfully updated");
        }).catch(() => {
            console.info("Google calendar token updating failed")
        });

    }
}
