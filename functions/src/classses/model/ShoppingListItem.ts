import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

@Serializable()
export class ShoppingListItem {

    static Fields = class {
        static readonly NAME = "name";
        static readonly DESCRIPTION = "description";
        static readonly OBJECT = "object";
        static readonly DATE_TO_BUY = "date_to_buy";
        static readonly IS_DONE = "is_done";
        static readonly LIST = "list";
        static readonly DATE_CREATED = "date_created";
        static readonly USER = "user";
        static readonly COUNT = "count";
        static readonly RELATED_OBJECT = "related_object";
    };

    @JsonProperty(ShoppingListItem.Fields.NAME) name?: string;
    @JsonProperty(ShoppingListItem.Fields.DESCRIPTION) description?: string;
    @JsonProperty(ShoppingListItem.Fields.COUNT) count?: number;
    @JsonProperty(ShoppingListItem.Fields.IS_DONE) isDone?: boolean;
    @JsonProperty(ShoppingListItem.Fields.LIST) list?: admin.firestore.DocumentReference;
    @JsonProperty(ShoppingListItem.Fields.OBJECT) housing?: admin.firestore.DocumentReference;
    @JsonProperty(ShoppingListItem.Fields.USER) user!: admin.firestore.DocumentReference;
    @JsonProperty(ShoppingListItem.Fields.RELATED_OBJECT) relatedObject?: admin.firestore.DocumentReference;
    @JsonProperty(ShoppingListItem.Fields.DATE_TO_BUY) dateToBuy?: admin.firestore.Timestamp;
    @JsonProperty(ShoppingListItem.Fields.DATE_CREATED) dateCreated?: admin.firestore.Timestamp;
}
