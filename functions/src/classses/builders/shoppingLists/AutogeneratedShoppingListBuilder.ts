import {ShoppingListBuilder} from "../../abstract/ShoppingListBuilder";
import * as admin from "firebase-admin";

export class AutogeneratedShoppingListBuilder extends ShoppingListBuilder {

    constructor(
        private user: admin.firestore.DocumentReference
    ) {
        super()
    }

    buildName(): ShoppingListBuilder {
        this.shoppingList.name = "Рекомендую купить";
        return this;
    }

    buildUser(): ShoppingListBuilder {
        this.shoppingList.user = this.user;
        return this;
    }

    buildIsHidden(): ShoppingListBuilder {
        this.shoppingList.isHidden = true;
        return this;
    }

}
