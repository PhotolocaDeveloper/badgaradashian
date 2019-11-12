import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import {TimeInterval} from "../../enums/TimeInterval";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

@Serializable()
export class Task {

    static Fields = class {
        static readonly NAME = "name";
        static readonly DESCRIPTION = "description";
        static readonly OBJECT = "object";
        static readonly DATE_TO_DO = "date_to_do";
        static readonly IS_DONE = "is_done";
        static readonly LIST = "list";
        static readonly REPETITION_RATE_MULTIPLIER = "repetition_rate_multiplier";
        static readonly REPETITION_TIME_INTERVAL = "repetition_rate_time_interval";
        static readonly LAST_REPETITION_DATE = "last_repetition_date";
        static readonly NEXT_REPETITION_DATE = "next_repetition_date";
        static readonly DATE_CREATED = "date_created";
        static readonly USER = "user";
    };

    @JsonProperty(Task.Fields.NAME) name?: string;
    @JsonProperty(Task.Fields.DESCRIPTION) description?: string;
    @JsonProperty(Task.Fields.OBJECT) object?: DocumentReference;
    @JsonProperty(Task.Fields.DATE_TO_DO) dateToDo?: Timestamp;
    @JsonProperty(Task.Fields.IS_DONE) isDone?: boolean;
    @JsonProperty(Task.Fields.LIST) list?: DocumentReference;
    @JsonProperty(Task.Fields.REPETITION_RATE_MULTIPLIER) repetitionRateMultiplier?: number;
    @JsonProperty(Task.Fields.REPETITION_TIME_INTERVAL) repetitionRateTimeInterval?: TimeInterval;
    @JsonProperty(Task.Fields.LAST_REPETITION_DATE) lastRepetitionDate?: Timestamp;
    @JsonProperty(Task.Fields.NEXT_REPETITION_DATE) nextRepetitionDate?: Timestamp;
    @JsonProperty(Task.Fields.DATE_CREATED) dateCreated?: Timestamp;
    @JsonProperty(Task.Fields.USER) user!: DocumentReference;
}
