import {BuyListBuilder} from "../abstract/BuyListBuilder";
import {BuyList} from "../model/BuyList";

export class BuyListCreator {
    constructor(
        private builder: BuyListBuilder
    ) {}

    get buyList(): BuyList | undefined {
        return this.builder.buyList
    }

    create() {
        this.builder.createBuyList();
        this.builder.buildName();
        this.builder.buildUser();
        this.builder.buildIsHidden();
    }
}
