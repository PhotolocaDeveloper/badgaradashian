import {ShoppingListBuilder} from "../../abstract/ShoppingListBuilder";
import * as admin from "firebase-admin";

export class SLBBase extends ShoppingListBuilder {

    constructor(private _user: admin.firestore.DocumentReference) {
        super();
    }

    buildIsHidden(): ShoppingListBuilder {
        this.shoppingList.isHidden = false;
        return this;
    }

    buildName(): ShoppingListBuilder {
        this.shoppingList.name = "Список покупок";
        return this;
    }

    buildUser(): ShoppingListBuilder {
        this.shoppingList.user = this._user;
        return this;
    }

}
