import {ShoppingListBuilder} from "../abstract/ShoppingListBuilder";
import {ShoppingList} from "../model/ShoppingList";

export class BuyListCreator {
    constructor(
        private builder: ShoppingListBuilder
    ) {}

    get buyList(): ShoppingList | undefined {
        return this.builder.shoppingList
    }

    create() {
        this.builder.createBuyList();
        this.builder.buildName();
        this.builder.buildUser();
        this.builder.buildIsHidden();
    }
}
