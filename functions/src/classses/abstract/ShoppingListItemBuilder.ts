import {ShoppingListItem} from "../model/ShoppingListItem";
import * as admin from "firebase-admin";

export abstract class ShoppingListItemBuilder {

    shoppingListItem!: ShoppingListItem;

    createBuyList() {
        const shoppingListItem = new ShoppingListItem();
        shoppingListItem.dateCreated = admin.firestore.Timestamp.now();
        this.shoppingListItem = shoppingListItem;
    }

    abstract buildName(): void;

    abstract buildDescription(): void;

    abstract buildCount(): void;

    abstract buildIsDone(): void;

    abstract buildList(): void;

    abstract buildHousing(): void;

    abstract buildUser(): void;

    abstract buildDateToBuy(): void;

    abstract buildDateCreated(): void;

    abstract buildRelatedObject(): void;

}
