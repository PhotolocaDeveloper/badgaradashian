import {HousingBuilder} from "../../abstract/HousingBuilder";
import {Photo} from "../../model/Photo";
import * as admin from "firebase-admin";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

export class HBDemo extends HousingBuilder {

    constructor(private _user: DocumentReference) {
        super();
    };

    buildDateCreated(): HousingBuilder {
        this.dateCreated = Timestamp.now();
        return this;
    }

    buildDescription(): HousingBuilder {
        this.description = "Демострационный объект";
        return this;
    }

    buildName(): HousingBuilder {
        this.name = "Квартира";
        return this;
    }

    buildPhotos(): HousingBuilder {
        const photo = new Photo();
        photo.url = "https://firebasestorage.googleapis.com/v0/b/badger-ce526.appspot.com/o/defaultObjectImage%2F1_photo.jpg?alt=media&token=f9c25374-166a-4cd5-955f-217f8880f4c6";
        photo.path = "gs://badger-ce526.appspot.com/defaultObjectImage/1_photo.jpg";
        photo.dateCreated = Timestamp.now();
        this.photos = [photo];
        return this;
    }

    buildUser(): HousingBuilder {
        this.user = this._user;
        return this;
    }

}
