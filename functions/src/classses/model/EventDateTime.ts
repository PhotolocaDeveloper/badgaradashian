import {JsonProperty, Serializable} from "typescript-json-serializer";
import {calendar_v3} from "googleapis";
import Schema$EventDateTime = calendar_v3.Schema$EventDateTime;

@Serializable()
export class EventDateTime implements Schema$EventDateTime {
    /**
     * The date, in the format &quot;yyyy-mm-dd&quot;, if this is an all-day event.
     */
    @JsonProperty() date?: string;
    /**
     * The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone.
     */
    @JsonProperty('date_time') dateTime?: string;
    /**
     * The time zone in which the time is specified. (Formatted as an IANA Time Zone Database name, e.g. &quot;Europe/Zurich&quot;.) For recurring events this field is required and specifies the time zone in which the recurrence is expanded. For single events this field is optional and indicates a custom time zone for the event start/end.
     */
    @JsonProperty('time_zone') timeZone?: string;
}
