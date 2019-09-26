import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import {TimeInterval} from "../../enums/TimeInterval";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

@Serializable()
export class CaseToDo {
    @JsonProperty() name?: string;
    @JsonProperty() description?: string;
    @JsonProperty() object?: DocumentReference;
    @JsonProperty('date_to_do') dateToDo?: Timestamp;
    @JsonProperty('is_done') isDone?: boolean;
    @JsonProperty() list?: DocumentReference;
    @JsonProperty('repetition_rate_multiplier') repetitionRateMultiplier?: number;
    @JsonProperty('repetition_rate_time_interval') repetitionRateTimeInterval?: TimeInterval;
    @JsonProperty('last_repetition_date') lastRepetitionDate?: Timestamp;
    @JsonProperty('next_repetition_date') nextRepetitionDate?: Timestamp;
    @JsonProperty('date_created') dateCreated?: Timestamp;
    @JsonProperty() user!: DocumentReference;
}
