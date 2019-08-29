import {BuyListBuilder} from "../abstract/BuyListBuilder";
import {BuyList} from "../model/BuyList";

export class BuyListCreator {
    constructor(
        private builder: BuyListBuilder
    ) {}

    get buyList() : BuyList | null {
        return this.builder.buyList
    }

    create() {
        this.builder.buildName();
        this.builder.buildUser();
        this.builder.buildDateCreation();
    }
}
