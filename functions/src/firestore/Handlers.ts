import {RoomHandlers} from "./handlers/RoomHandlers";
import {HousingHandlers} from "./handlers/HousingHandlers";
import {TaskHandler} from "./handlers/TaskHandler";
import {ShoppingListItemHandlers} from "./handlers/ShoppingListItemHandlers";
import {InventoryHandlers} from "./handlers/InventoryHandlers";
import {InventoryListHandlers} from "./handlers/InventoryListHandlers";
import {TaskListHandlers} from "./handlers/TaskListHandlers";
import {PhotoHandlers} from "./handlers/PhotoHandlers";
import {ShoppingListHandlers} from "./handlers/ShoppingListHandlers";
import {UserHandlers} from "./handlers/UserHandlers";
import {TaskListItemHandlers} from "./handlers/TaskListItemHandlers";
import {NotificationHandlers} from "./handlers/NotificationHandlers";
import {ShoppingItemLocalHandlers} from "./handlers/ShoppingItemLocalHandlers";

export const room = new RoomHandlers();
export const housing = new HousingHandlers();
export const task = new TaskHandler();
export const taskList = new TaskListHandlers();
export const taskListItem = new TaskListItemHandlers();
export const shoppingListItem = new ShoppingListItemHandlers();
export const shoppingList = new ShoppingListHandlers();
export const inventory = new InventoryHandlers();
export const inventoryList = new InventoryListHandlers();
export const photo = new PhotoHandlers();
export const user = new UserHandlers();
export const notifications = new NotificationHandlers();
export const shoppingItemLocal = new ShoppingItemLocalHandlers();
