import {BuyList} from "../model/BuyList";
import * as admin from "firebase-admin";

export abstract class BuyListBuilder {

    buyList?: BuyList;

    createBuyList() {
        const buyList = new BuyList();
        buyList.dateCreated = admin.firestore.Timestamp.now();
        this.buyList = buyList;
    }

    abstract buildIsHidden(): void;
    abstract buildName(): void;
    abstract buildUser(): void;

}
