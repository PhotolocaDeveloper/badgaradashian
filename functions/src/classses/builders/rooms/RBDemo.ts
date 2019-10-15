import {RoomBuilder} from "../../abstract/RoomBuilder";
import {Photo} from "../../model/Photo";
import * as admin from "firebase-admin";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

export class RBDemo extends RoomBuilder {

    constructor(
        private type: RBDemo$Types,
        private _user: DocumentReference,
        private _housing: DocumentReference) {
        super();
    }

    private get _name(): string {
        let name: string = "";
        switch (this.type) {
            case RBDemo$Types.BATH_ROOM:
                name = "Ванная комната";
                break;
            case RBDemo$Types.BEDROOM:
                name = "Спальная комната";
                break;
            case RBDemo$Types.KITCHEN:
                name = 'Кухня';
                break;
            case RBDemo$Types.LIVING_ROOM:
                name = "Гостинная";
                break;
        }
        return name;
    }

    private get _photos(): Photo[] {
        let photoUrl: string;
        let photoPath: string;
        switch (this.type) {
            case RBDemo$Types.BATH_ROOM:
                photoUrl = "https://firebasestorage.googleapis.com/v0/b/badger-ce526.appspot.com/o/defaultObjectImage%2F4_photo.jpg?alt=media&token=62919ae6-c22c-4782-9c8d-6364a684b850";
                photoPath = "gs://badger-ce526.appspot.com/defaultObjectImage/4_photo.jpg";
                break;
            case RBDemo$Types.BEDROOM:
                photoUrl = "https://firebasestorage.googleapis.com/v0/b/badger-ce526.appspot.com/o/defaultObjectImage%2F5_photo.jpg?alt=media&token=5aeae982-58c7-4613-9ca4-bb9457e679cb";
                photoPath = "gs://badger-ce526.appspot.com/defaultObjectImage/5_photo.jpg";
                break;
            case RBDemo$Types.KITCHEN:
                photoUrl = "https://firebasestorage.googleapis.com/v0/b/badger-ce526.appspot.com/o/defaultObjectImage%2F7_photo.jpg?alt=media&token=62f3bd5e-c9b0-48f5-a374-0749c2a1834b";
                photoPath = "gs://badger-ce526.appspot.com/defaultObjectImage/7_photo.jpg";
                break;
            case RBDemo$Types.LIVING_ROOM:
                photoUrl = "https://firebasestorage.googleapis.com/v0/b/badger-ce526.appspot.com/o/defaultObjectImage%2F8_photo.jpg?alt=media&token=60a1e38d-b6d9-4f35-80bc-334191fdee7b";
                photoPath = "gs://badger-ce526.appspot.com/defaultObjectImage/8_photo.jpg";
                break;
        }
        const photo = new Photo();
        photo.path = photoPath!;
        photo.url = photoUrl!;
        photo.dateCreated = Timestamp.now();
        return [photo];
    }

    buildDateCreated(): RoomBuilder {
        this.dateCreated = Timestamp.now();
        return this;
    }

    buildDescription(): RoomBuilder {
        this.description = "Демонстрационная комната";
        return this;
    }

    buildHousing(): RoomBuilder {
        this.object = this._housing;
        return this;
    }

    buildName(): RoomBuilder {
        this.name = this._name;
        return this;
    }

    buildPhotos(): RoomBuilder {
        this.photos = this._photos;
        return this;
    }

    buildUser(): RoomBuilder {
        this.user = this._user;
        return this;
    }

}

export enum RBDemo$Types {
    KITCHEN, LIVING_ROOM, BEDROOM, BATH_ROOM
}
