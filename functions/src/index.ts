import * as functions from 'firebase-functions';
import {onUserCreateHandler} from "./handlers/OnUserCreateHandler";
import * as admin from "firebase-admin";
import {onUserDeleteHandler} from "./handlers/OnUserDeleteHandler";

admin.initializeApp();

export const onUserCreate = functions.auth.user().onCreate(onUserCreateHandler);
export const onUserDelete = functions.auth.user().onDelete(onUserDeleteHandler);
