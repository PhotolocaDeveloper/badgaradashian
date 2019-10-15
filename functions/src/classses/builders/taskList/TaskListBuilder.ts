import * as admin from "firebase-admin";
import {TaskList} from "../../model/TaskList";

export abstract class TaskListBuilder {

    protected name?: string;
    protected icon?: string;
    protected user?: admin.firestore.DocumentReference;
    protected dateCreated?: admin.firestore.Timestamp;
    private taskList?: TaskList;

    abstract buildName(): TaskListBuilder;

    abstract buildIcon(): TaskListBuilder;

    abstract buildUser(): TaskListBuilder;

    abstract buildDateCreated(): TaskListBuilder;

    build(): TaskListBuilder {
        this.taskList = new TaskList();
        this.taskList.name = this.name;
        this.taskList.icon = this.icon;
        this.taskList.user = this.user;
        this.taskList.dateCreated = this.dateCreated;
        return this;
    }

    get(): TaskList | undefined {
        return this.taskList;
    }
}
