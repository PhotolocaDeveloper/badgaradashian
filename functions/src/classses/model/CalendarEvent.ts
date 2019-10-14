import {JsonProperty, Serializable} from "typescript-json-serializer";
import {calendar_v3} from "googleapis";
import {EventDateTime} from "./EventDateTime";
import Schema$Event = calendar_v3.Schema$Event;

@Serializable()
export class CalendarEvent implements Schema$Event {
    @JsonProperty() id?: string;
    @JsonProperty() description?: string;
    @JsonProperty() summary?: string;
    @JsonProperty() start?: EventDateTime;
    @JsonProperty() end?: EventDateTime;
    @JsonProperty() recurrence?: string[];
}

