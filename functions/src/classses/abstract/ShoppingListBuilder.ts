import {ShoppingList} from "../model/ShoppingList";
import * as admin from "firebase-admin";

export abstract class ShoppingListBuilder {

    shoppingList!: ShoppingList;

    protected constructor() {
        this.shoppingList = new ShoppingList();
    }

    createBuyList() {
        const buyList = new ShoppingList();
        buyList.dateCreated = admin.firestore.Timestamp.now();
        this.shoppingList = buyList;
    }

    build() {
        this.shoppingList.dateCreated = admin.firestore.Timestamp.now();
        return this;
    }

    get(): ShoppingList {
        return this.shoppingList;
    }

    abstract buildIsHidden(): ShoppingListBuilder;

    abstract buildName(): ShoppingListBuilder;

    abstract buildUser(): ShoppingListBuilder;

}
