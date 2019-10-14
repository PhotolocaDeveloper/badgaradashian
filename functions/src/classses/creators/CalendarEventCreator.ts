import {CalendarEventBuilder} from "../builders/calendarEvents/CalendarEventBuilder";
import {calendar_v3} from "googleapis";
import Schema$Event = calendar_v3.Schema$Event;

export class CalendarEventCreator {
    constructor(private builder: CalendarEventBuilder) {
    }

    get(): Schema$Event {
        return this.builder.event!
    }

    create(): CalendarEventCreator {
        this.builder
            .buildColorId()
            .buildDescription()
            .buildEnd()
            .buildStart()
            .buildSummary()
            .buildRecurrence()
            .build();
        return this
    }
}
