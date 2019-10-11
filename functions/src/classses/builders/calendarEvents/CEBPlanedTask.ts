import {CalendarEventBuilder} from "./CalendarEventBuilder";
import {CaseToDo} from "../../model/CaseToDo";

export class CEBPlanedTask extends CalendarEventBuilder {

    constructor(private task: CaseToDo) {
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
            this.endTime = {
                date: this.task.nextRepetitionDate.toDate().toISOString()
            }
        }
        return this
    }

    buildStart(): CalendarEventBuilder {
        if (this.task.nextRepetitionDate) {
            this.startTime = {
                date: this.task.nextRepetitionDate.toDate().toISOString()
            }
        }
        return this
    }

    buildSummary(): CalendarEventBuilder {
        this.summary = this.task.name;
        return this
    }

}
