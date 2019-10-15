import {Housing} from "../model/Housing";
import {Photo} from "../model/Photo";
import * as admin from "firebase-admin";
import Timestamp = admin.firestore.Timestamp;
import DocumentReference = admin.firestore.DocumentReference;

export abstract class HousingBuilder {

    protected name?: string;
    protected description?: string;
    protected user?: DocumentReference;
    protected dateCreated?: Timestamp;
    protected photos?: Photo[];
    private housing?: Housing;

    abstract buildName(): HousingBuilder;

    abstract buildDescription(): HousingBuilder;

    abstract buildUser(): HousingBuilder;

    abstract buildDateCreated(): HousingBuilder;

    abstract buildPhotos(): HousingBuilder;

    build(): HousingBuilder {
        this.housing = new Housing();
        this.housing.name = this.name;
        this.housing.description = this.description;
        this.housing.user = this.user;
        this.housing.dateCreated = this.dateCreated;
        this.housing.photos = this.photos;
        return this;
    }

    get(): Housing | undefined {
        return this.housing;
    }

}
