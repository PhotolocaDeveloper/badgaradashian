import {InventoryListBuilder} from "../../abstract/InventoryListBuilder";
import * as admin from "firebase-admin";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

export class ILBBase extends InventoryListBuilder {

    constructor(
        private readonly _user: DocumentReference,
        private readonly _housing: DocumentReference,
        private readonly _room: DocumentReference
    ) {
        super();
    }

    buildDateCreation(): InventoryListBuilder {
        this.dateCreated = Timestamp.now();
        return this;
    }

    buildDescription(): InventoryListBuilder {
        return this;
    }

    buildHousing(): InventoryListBuilder {
        this.housing = this._housing;
        return this;
    }

    buildIcon(): InventoryListBuilder {
        return this;
    }

    buildName(): InventoryListBuilder {
        this.name = "Список инвентаря";
        return this;
    }

    buildRoom(): InventoryListBuilder {
        this.room = this._room;
        return this;
    }

    buildUser(): InventoryListBuilder {
        this.user = this._user;
        return this;
    }

}
