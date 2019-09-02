import {UserSettingSynchronization} from "../classses/model/UserSettingSynchronization";
import * as admin from "firebase-admin";
import {FirestoreCollection} from "../enums/FirestoreCollection";
import {UserRecord} from "firebase-functions/lib/providers/auth";
import {serialize} from "typescript-json-serializer";
import {AutogeneratedShoppingListBuilder} from "../classses/builders/shoppingLists/AutogeneratedShoppingListBuilder";
import {BuyListCreator} from "../classses/creators/BuyListCreator";
import {UserSettingDefaultValues} from "../classses/model/UserSettingDefaultValues";
import {IBAutoGeneratedShoppingListId} from "../classses/builders/indetefires/IBAutoGeneratedShoppingListId";
import {IdentifierCreator} from "../classses/creators/IdentifierCreator";

/**
 * Инициализирует настройки синхронизации с Google Calendar при создании пользователя.
 * @param userRecord
 */
export function onUserCreateHandler(userRecord: UserRecord) {

    const userId = userRecord.uid;

    const syncSettingAddResult = createUserSyncSettings(userId);
    const createAutogeneratedByuListResult = createAutogeneratedByuList(userId);

    return Promise.all([syncSettingAddResult, createAutogeneratedByuListResult]);
}

/***
 * Создание пользовательских настроек синфронизации с Google Calendar
 * @param uid
 */
function createUserSyncSettings(uid: string): Promise<any> {
    const userSettingSyncronization = new UserSettingSynchronization(uid);

    return admin.firestore()
        .collection(FirestoreCollection.UserSettings)
        .doc(userSettingSyncronization.id)
        .set(serialize(userSettingSyncronization));
}

/**
 * Создаёт список для сохранения автосгенерированных покупок пользователя
 * @param uid
 */
function createAutogeneratedByuList(uid: string): Promise<any> {
    const userReference = admin.firestore()
        .collection(FirestoreCollection.Users)
        .doc(uid);

    const ibAutogeneratedShoppingListBuilder = new IBAutoGeneratedShoppingListId(uid);
    const idCreator = new IdentifierCreator(ibAutogeneratedShoppingListBuilder);

    idCreator.construct();

    const buyListBuilder = new AutogeneratedShoppingListBuilder(userReference);
    const buyListCreator = new BuyListCreator(buyListBuilder);

    buyListCreator.create();

    const buyList = buyListCreator.buyList;
    const reference = admin.firestore().collection(FirestoreCollection.BuyLists).doc(idCreator.get());

    const createAutoGeneratedByuListResult = reference.set(serialize(buyList), {merge: true});

    const saveAutogeneratedByuListReferenceResult = saveAutogeneratedByuListReference(uid, reference);

    return Promise.all([createAutoGeneratedByuListResult, saveAutogeneratedByuListReferenceResult])
}

/**
 * Сохраняет ссылку на список для автосгенерированных покупок в настройках пользовтеля
 * @param uid
 * @param buyListReference
 */
function saveAutogeneratedByuListReference(uid: string, buyListReference: admin.firestore.DocumentReference) {
    const userDefaultValues = new UserSettingDefaultValues(uid);

    userDefaultValues.autoGeneratedBuyList = buyListReference;

    return admin.firestore()
        .collection(FirestoreCollection.UserSettings)
        .doc(userDefaultValues.id).set(serialize(userDefaultValues), {merge: true})
}
