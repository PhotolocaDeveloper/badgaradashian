import {CalendarEventBuilder} from "./CalendarEventBuilder";
import {Task} from "../../model/Task";
import {EventDateTime} from "../../model/EventDateTime";
import moment = require("moment");

export class CEBPlanedTask extends CalendarEventBuilder {

    constructor(private task: Task) {
        super()
    }

    buildColorId(): CalendarEventBuilder {
        this.colorId = "#47A599";
        return this
    }

    buildDescription(): CalendarEventBuilder {
        this.description = this.task.description;
        return this
    }

    buildEnd(): CalendarEventBuilder {
        if (this.task.nextRepetitionDate) {
            const date = this.task.nextRepetitionDate.toDate();
            const dateString = moment(date).format("YYYY-MM-DD");
            this.endTime = new EventDateTime();
            this.endTime.date = dateString;
        }
        return this
    }

    buildStart(): CalendarEventBuilder {
        if (this.task.nextRepetitionDate) {
            const date = this.task.nextRepetitionDate.toDate();
            const dateString = moment(date).format("YYYY-MM-DD");
            this.startTime = new EventDateTime();
            this.startTime.date = dateString;
        }
        return this
    }

    buildSummary(): CalendarEventBuilder {
        this.summary = this.task.name;
        return this
    }

    buildRecurrence(): CalendarEventBuilder {
        this.recurrenceFreq = this.task.repetitionRateTimeInterval;
        this.recurrenceInterval = this.task.repetitionRateMultiplier;
        return this;
    }

}
