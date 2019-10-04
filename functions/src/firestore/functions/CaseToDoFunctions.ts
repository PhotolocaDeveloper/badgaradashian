import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {deserialize, serialize} from "typescript-json-serializer";
import {CaseToDo} from "../../classses/model/CaseToDo";
import {CaseToDoNotifBuilder} from "../../classses/builders/notifications/CaseToDoNotifBuilder";
import {NotificationCreator} from "../../classses/creators/NotificationCreator";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../../enums/FirestoreCollection";
import {Helper} from "../../classses/helpers/Helper";
import {Change} from "firebase-functions";

export class CaseToDoFunctions {

    createTaskInListCollection(snapshot: DocumentSnapshot): Promise<any> {
        if (snapshot === null || !snapshot.exists) return Promise.resolve();
        const taskItem = deserialize(snapshot.data(), CaseToDo);
        if (!taskItem.list) return Promise.resolve();
        return taskItem.list.collection(FirestoreCollection.Tasks).doc(snapshot.id).set(snapshot.data()!)
    }

    deleteTaskInListCollection(snapshot: DocumentSnapshot): Promise<any> {
        if (snapshot === null || !snapshot.exists) return Promise.resolve();
        const taskItem = deserialize(snapshot.data(), CaseToDo);
        if (!taskItem.list) return Promise.resolve();
        return taskItem.list.collection(FirestoreCollection.Tasks).doc(snapshot.id).delete()
    }

    updateTaskInListCollection(change: Change<DocumentSnapshot>): Promise<any> {
        return Promise.all([
            this.deleteTaskInListCollection(change.before),
            this.createTaskInListCollection(change.after)
        ]);
    }

    async updateDateToDoInList(snapshot: DocumentSnapshot) {
        if (!snapshot || !snapshot.exists) return Promise.resolve("Snapshot is missing");

        const tasksCollection = snapshot.ref.parent;
        const taskListRef = tasksCollection.parent;

        if (!taskListRef) return Promise.resolve("List don't exist");

        const querySnapshot = await tasksCollection
            .orderBy("date_to_do", "desc")
            .limit(1)
            .get();

        let newDate = undefined;
        const firstItem = querySnapshot.docs.pop();

        if (firstItem) {
            const task = deserialize(firstItem.data(), CaseToDo);
            newDate = task.dateToDo
        }

        return taskListRef.update({"date_to_do": newDate})
    }

    /**
     * Изменяет количество задач в связанных объектах при изменении задачи
     * @param before
     * @param after
     */
    updateTaskInHouseCount(before: DocumentSnapshot, after: DocumentSnapshot) {
        const itemBefore = deserialize(before.data(), CaseToDo);
        const itemAfter = deserialize(after.data(), CaseToDo);
        if (itemBefore.object === itemAfter.object) return Promise.resolve();
        return Promise.all([
            this.decrementTaskInHouseCount(before),
            this.incrementTaskInHouseCount(after)
        ])
    }

    /**
     * Изменяет количество задач в связанных списках при изменении задачи
     * @param before
     * @param after
     */
    updateTaskInListCount(before: DocumentSnapshot, after: DocumentSnapshot) {
        const itemBefore = deserialize(before.data(), CaseToDo);
        const itemAfter = deserialize(after.data(), CaseToDo);
        if (itemBefore.list === itemAfter.list) return Promise.resolve();
        return Promise.all([
            this.decrementTasksInListCount(before),
            this.incrementTasksInListCount(after)
        ])
    }

    /**
     * Увеличивает счётчик количества задач в связанном объекте
     * @param snapshot
     */
    incrementTaskInHouseCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), CaseToDo);
        if (item.object === undefined) return Promise.resolve();
        return Helper.firestore().incrementField(item.object, "tasks_count")
    }

    /**
     * Уменьшает счётчик количества задач в связанном объекте
     * @param snapshot
     */
    decrementTaskInHouseCount(snapshot: DocumentSnapshot) {
        const item = deserialize(snapshot.data(), CaseToDo);
        if (item.object === undefined) return Promise.resolve();
        return Helper.firestore().decrementField(item.object, "tasks_count")
    }

    /**
     * Увеличивает счетчик количества задач в списке дел на 1
     * @param snapshot
     */
    incrementTasksInListCount(snapshot: DocumentSnapshot) {
        const taskItem = deserialize(snapshot.data(), CaseToDo);
        if (taskItem.list === undefined) return Promise.resolve();
        return Helper.firestore().incrementField(taskItem.list, "items_count")
    }

    /**
     * Уменьшает счетчик количества задач в списке дел на 1
     * @param snapshot
     */
    decrementTasksInListCount(snapshot: DocumentSnapshot) {
        const taskItem = deserialize(snapshot.data(), CaseToDo);
        if (taskItem.list === undefined) return Promise.resolve();
        return Helper.firestore().decrementField(taskItem.list, "items_count")
    }

    /**
     * Создаёт уведомление о необходимости выоплнить запланированное дело
     * @param snapshot
     */
    createOnToDoCaseNotification(snapshot: DocumentSnapshot): Promise<any> {
        const caseToDo = deserialize(snapshot.data(), CaseToDo);
        const uid = caseToDo.user.id;

        const notificationBuilder = new CaseToDoNotifBuilder(uid, snapshot.ref, caseToDo);
        const notificationCreator = new NotificationCreator(notificationBuilder);

        const notification = notificationCreator.construct().get();

        return admin.firestore().collection(FirestoreCollection.Notifications).doc().create(serialize(notification));
    }


}
