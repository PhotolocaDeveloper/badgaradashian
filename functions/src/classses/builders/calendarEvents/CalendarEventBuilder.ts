import {calendar_v3} from "googleapis";
import Schema$Event = calendar_v3.Schema$Event;
import Schema$EventDateTime = calendar_v3.Schema$EventDateTime;

export abstract class CalendarEventBuilder {

    event?: Schema$Event;

    protected summary?: string;
    protected description?: string;
    protected startTime?: Schema$EventDateTime;
    protected endTime?: Schema$EventDateTime;
    protected colorId?: string;

    abstract buildSummary(): CalendarEventBuilder;

    abstract buildDescription(): CalendarEventBuilder;

    abstract buildStart(): CalendarEventBuilder;

    abstract buildEnd(): CalendarEventBuilder;

    abstract buildColorId(): CalendarEventBuilder;

    build() {
        this.event = {
            summary: this.summary,
            description: this.description,
            start: this.startTime,
            end: this.endTime,
            colorId: this.colorId
        }
    }
}
