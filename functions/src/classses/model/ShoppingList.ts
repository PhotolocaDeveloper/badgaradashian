import {JsonProperty, Serializable} from "typescript-json-serializer";
import * as admin from "firebase-admin";

@Serializable()
export class ShoppingList {

    static Fields = class {
        static readonly NAME = "name";
        static readonly IS_HIDDEN = "is_hidden";
        static readonly USER = "user";
        static readonly ITEMS_COUNT = "items_count";
        static readonly DONE_ITEMS_COUNT = "done_item_count";
        static readonly DATE_CREATED = "date_created";
        static readonly DATE_TO_DO = "date_to_do";
    };

    @JsonProperty(ShoppingList.Fields.NAME) name?: string;
    @JsonProperty(ShoppingList.Fields.USER) user?: admin.firestore.DocumentReference;
    @JsonProperty(ShoppingList.Fields.DATE_CREATED) dateCreated?: admin.firestore.Timestamp;
    @JsonProperty(ShoppingList.Fields.IS_HIDDEN) isHidden?: boolean;
}
