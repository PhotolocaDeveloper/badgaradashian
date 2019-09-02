import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

@Serializable()
export class ShoppingListItem {
    @JsonProperty() name?: string;

    @JsonProperty() description?: string;
    @JsonProperty() count?: number;

    @JsonProperty('is_done ') isDone?: boolean;

    @JsonProperty() list?: admin.firestore.DocumentReference;
    @JsonProperty() housing?: admin.firestore.DocumentReference;
    @JsonProperty() user?: admin.firestore.DocumentReference;
    @JsonProperty('related_object') relatedObject?: admin.firestore.DocumentReference;

    @JsonProperty('date_to_buy') dateToBuy?: admin.firestore.Timestamp;
    @JsonProperty('date_created') dateCreated?: admin.firestore.Timestamp;
}
