import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";
import {TimeInterval} from "../../enums/TimeInterval";
import Firestore = admin.firestore;

@Serializable()
export class Inventory {

    @JsonProperty() name?: string;
    @JsonProperty() description?: string;
    @JsonProperty() count?: number;
    @JsonProperty() user?: Firestore.DocumentReference;
    @JsonProperty('inventory_list') inventoryList?: Firestore.DocumentReference;
    @JsonProperty('replacement_frequency_time_interval') replacementFrequencyTimeInterval?: TimeInterval;
    @JsonProperty('replacement_frequency_multiplier') replacementFrequencyMultiplier?: number;
    @JsonProperty('last_replacement_date') lastReplacementDate?: Firestore.Timestamp;
    @JsonProperty('next_replacement_date') nextReplacementDate?: Firestore.Timestamp;
    @JsonProperty('life_time_multiplier') lifeTimeMultiplier?: number;
    @JsonProperty('life_time__time_interval') lifeTimeTimeInterval?: TimeInterval;
    @JsonProperty('object') housing?: Firestore.DocumentReference;
    @JsonProperty() room?: Firestore.DocumentReference;
    @JsonProperty('installation_date') installationDate?: Firestore.Timestamp;
    @JsonProperty('date_created') dateCreated?: Firestore.Timestamp;

    getParentRefs(): admin.firestore.DocumentReference[] {
        return [this.housing, this.room, this.inventoryList].filter(ref => ref !== undefined).map(ref => ref!)
    }
}
