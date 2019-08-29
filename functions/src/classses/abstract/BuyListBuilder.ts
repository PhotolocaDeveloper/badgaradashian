import {BuyList} from "../model/BuyList";

export abstract class BuyListBuilder {

    get buyList(): BuyList | null {
        return this._buyList;
    }

    set buyList(value: BuyList | null) {
        this._buyList = value;
    }

    private _buyList: BuyList | null = null;

    createBuyList() {
        this.buyList = new BuyList();
    }

    abstract buildName(): void;
    abstract buildUser(): void;
    abstract buildDateCreation(): void;

}
