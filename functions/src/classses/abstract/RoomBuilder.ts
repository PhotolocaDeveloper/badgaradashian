import {Room} from "../model/Room";
import {Photo} from "../model/Photo";
import * as admin from "firebase-admin";
import DocumentReference = admin.firestore.DocumentReference;
import Timestamp = admin.firestore.Timestamp;

export abstract class RoomBuilder {

    name?: string;
    description?: string;
    object?: DocumentReference;
    user?: DocumentReference;
    dateCreated?: Timestamp;
    photos?: Photo[];
    private room?: Room;

    abstract buildName(): RoomBuilder;

    abstract buildDescription(): RoomBuilder;

    abstract buildUser(): RoomBuilder;

    abstract buildDateCreated(): RoomBuilder;

    abstract buildPhotos(): RoomBuilder;

    abstract buildHousing(): RoomBuilder;

    build(): RoomBuilder {
        this.room = new Room();
        this.room.name = this.name;
        this.room.description = this.description;
        this.room.user = this.user;
        this.room.dateCreated = this.dateCreated;
        this.room.object = this.object;
        this.room.photos = this.photos;
        return this;
    }

    get(): Room | undefined {
        return this.room
    }
}
