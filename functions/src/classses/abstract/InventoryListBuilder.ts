import {InventoryList} from "../model/InventoryList";
import * as admin from "firebase-admin";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

export abstract class InventoryListBuilder {

    protected name?: string;
    protected description?: string;
    protected icon?: string;
    protected user?: DocumentReference;
    protected room?: DocumentReference;
    protected housing?: DocumentReference;
    protected dateCreated?: Timestamp;
    private inventoryList?: InventoryList;

    abstract buildName(): InventoryListBuilder;

    abstract buildDescription(): InventoryListBuilder;

    abstract buildIcon(): InventoryListBuilder;

    abstract buildUser(): InventoryListBuilder;

    abstract buildRoom(): InventoryListBuilder;

    abstract buildHousing(): InventoryListBuilder;

    abstract buildDateCreation(): InventoryListBuilder;

    build(): InventoryListBuilder {
        this.inventoryList = new InventoryList();
        this.inventoryList.name = this.name;
        this.inventoryList.description = this.description;
        this.inventoryList.icon = this.icon;
        this.inventoryList.user = this.user;
        this.inventoryList.room = this.room;
        this.inventoryList.housing = this.housing;
        this.inventoryList.dateCreated = this.dateCreated;
        return this;
    }

    get(): InventoryList | undefined {
        return this.inventoryList;
    }
}
