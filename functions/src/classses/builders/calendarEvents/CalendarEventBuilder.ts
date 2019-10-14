import {calendar_v3} from "googleapis";
import {TimeInterval} from "../../../enums/TimeInterval";
import {CalendarEvent} from "../../model/CalendarEvent";
import {EventDateTime} from "../../model/EventDateTime";
import Schema$Event = calendar_v3.Schema$Event;

export abstract class CalendarEventBuilder {

    event?: Schema$Event;

    protected summary?: string;
    protected description?: string;
    protected startTime?: EventDateTime;
    protected endTime?: EventDateTime;
    protected colorId?: string;

    protected recurrenceFreq?: TimeInterval;
    protected recurrenceInterval?: number;

    abstract buildSummary(): CalendarEventBuilder;

    abstract buildDescription(): CalendarEventBuilder;

    abstract buildStart(): CalendarEventBuilder;

    abstract buildEnd(): CalendarEventBuilder;

    abstract buildColorId(): CalendarEventBuilder;

    abstract buildRecurrence(): CalendarEventBuilder;

    build() {
        this.event = new CalendarEvent();
        this.event.summary = this.summary;
        this.event.description = this.description;
        this.event.start = this.startTime;
        this.event.end = this.endTime;

        if (this.recurrenceFreq && this.recurrenceInterval) {
            let frequency = "";
            switch (this.recurrenceFreq) {
                case TimeInterval.Day:
                    frequency = "DAILY";
                    break;
                case TimeInterval.Month:
                    frequency = "MONTHLY";
                    break;
                case TimeInterval.Week:
                    frequency = "WEEKLY";
                    break;
                case TimeInterval.Year:
                    frequency = "YEARLY";
                    break;
            }
            this.event.recurrence = ["RRULE:FREQ=" + frequency + ";INTERVAL=" + this.recurrenceInterval + ";"]
        }
        console.log(this.event)
    }
}
