import {TaskListBuilder} from "./TaskListBuilder";
import * as admin from "firebase-admin";
import Timestamp = admin.firestore.Timestamp;

export class TLBBase extends TaskListBuilder {

    constructor(private _user: admin.firestore.DocumentReference) {
        super();
    }


    buildDateCreated(): TaskListBuilder {
        this.dateCreated = Timestamp.now();
        return this;
    }

    buildIcon(): TaskListBuilder {
        return this;
    }

    buildName(): TaskListBuilder {
        this.name = "Список задач";
        return this;
    }

    buildUser(): TaskListBuilder {
        this.user = this._user;
        return this;
    }

}
