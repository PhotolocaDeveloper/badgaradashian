import {ShoppingListItem} from "../model/ShoppingListItem";
import {ShoppingListItemBuilder} from "../abstract/ShoppingListItemBuilder";

export class ShoppingListItemCreator {
    constructor(
        private builder: ShoppingListItemBuilder
    ) {
    }

    public get(): ShoppingListItem | undefined {
        return this.builder.shoppingListItem
    }

    public construct() {
        this.builder.createBuyList();
        this.builder.buildName();
        this.builder.buildDescription();
        this.builder.buildCount();
        this.builder.buildIsDone();
        this.builder.buildList();
        this.builder.buildHousing();
        this.builder.buildUser();
        this.builder.buildDateToBuy();
        this.builder.buildDateCreated();
    }
}
