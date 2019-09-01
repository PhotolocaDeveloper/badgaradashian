import {ShoppingList} from "../model/ShoppingList";
import * as admin from "firebase-admin";

export abstract class ShoppingListBuilder {

    shoppingList?: ShoppingList;

    createBuyList() {
        const buyList = new ShoppingList();
        buyList.dateCreated = admin.firestore.Timestamp.now();
        this.shoppingList = buyList;
    }

    abstract buildIsHidden(): void;
    abstract buildName(): void;
    abstract buildUser(): void;

}
