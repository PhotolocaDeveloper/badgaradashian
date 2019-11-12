import {TimeInterval} from "../../enums/TimeInterval";

export class DateHelper {

    WEEK_MILLIS_DURATION = 604800000;
    DAY_MILLIS_DURATION = 86400000;

    calculateNextRepetitionDate(dateToDo: Date, now: Date, interval: TimeInterval, multiplier: number): Date {
        switch (interval) {
            case TimeInterval.Year:
                return this.datePlusYear(dateToDo, now, multiplier);
            case TimeInterval.Week:
                return this.datePlusInterval(dateToDo, now, multiplier * this.WEEK_MILLIS_DURATION);
            case TimeInterval.Month:
                return this.datePlusMonth(dateToDo, now, multiplier);
            case TimeInterval.Day:
                return this.datePlusInterval(dateToDo, now, multiplier * this.DAY_MILLIS_DURATION)
        }
    }

    /**
     * Расчитывает дату следующего повторения события после текущей даты
     * @param date - Дата начального события
     * @param now - Текущая дата
     * @param interval - Интервал в милисекундах
     */
    datePlusInterval(date: Date, now: Date, interval: number): Date {
        const deltaIntervals = Math.floor((now.getTime() - date.getTime()) / interval);
        const newTime = date.getTime() + interval * (deltaIntervals + 1);
        return new Date(newTime)

    }

    datePlusYear(date: Date, now: Date, multiplier: number): Date {
        const nowYear = now.getFullYear();
        const dateYear = date.getFullYear();
        const deltaYears = nowYear - dateYear;
        const intervalYears = (deltaYears + multiplier) - (deltaYears + multiplier) % multiplier;
        date.setFullYear(date.getFullYear() + intervalYears);
        return date;
    }

    datePlusMonth(date: Date, now: Date, multiplier: number): Date {
        const nowYear = now.getFullYear();
        const nowMonth = now.getMonth();
        const todoYear = date.getFullYear();
        const todoMonth = date.getMonth();
        const deltaMonth = (nowYear - todoYear) * 12 + nowMonth - todoMonth;
        const intervalMonth = (deltaMonth + multiplier) - (deltaMonth + multiplier) % multiplier;
        date.setMonth(date.getMonth() + intervalMonth);
        return date;
    }

}
