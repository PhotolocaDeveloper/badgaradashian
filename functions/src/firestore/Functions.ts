import {GeneralFunctions} from "./functions/GeneralFunctions";
import {InventoryFunctions} from "./functions/InventoryFunctions";
import {TaskFunctions} from "./functions/TaskFunctions";
import {ShoppingFunctions} from "./functions/ShoppingFunctions";
import {RoomFunctions} from "./functions/RoomFunctions";
import {HousingFunctions} from "./functions/HousingFunctions";
import {InventoryListFunctions} from "./functions/InventoryListFunctions";
import {TaskListFunctions} from "./functions/TaskListFunctions";
import {NotificationFunctions} from "./functions/NotificationFunctions";
import {CalendarEventFunctions} from "./functions/CalendarEventFunctions";

export class Functions {

    private static generalFunctions: GeneralFunctions;
    private static inventoryFunctions: InventoryFunctions;
    private static inventoryListFunctions: InventoryListFunctions;
    private static taskFunctions: TaskFunctions;
    private static taskListFunctions: TaskListFunctions;
    private static shoppingFunctions: ShoppingFunctions;
    private static roomFunctions: RoomFunctions;
    private static housingFunctions: HousingFunctions;
    private static notificationsFunctions: NotificationFunctions;
    private static calendarEventsFunctions: CalendarEventFunctions;

    static calendarEvent(): CalendarEventFunctions {
        if (!Functions.calendarEventsFunctions) {
            Functions.calendarEventsFunctions = new CalendarEventFunctions();
        }
        return Functions.calendarEventsFunctions;
    }

    static notification(): NotificationFunctions {
        if (!Functions.notificationsFunctions) {
            Functions.notificationsFunctions = new NotificationFunctions();
        }
        return Functions.notificationsFunctions;
    }

    static general(): GeneralFunctions {
        if (!Functions.generalFunctions) {
            Functions.generalFunctions = new GeneralFunctions();
        }
        return Functions.generalFunctions;
    }

    static inventory(): InventoryFunctions {
        if (!Functions.inventoryFunctions) {
            Functions.inventoryFunctions = new InventoryFunctions();
        }
        return Functions.inventoryFunctions;
    }

    static inventoryList(): InventoryListFunctions {
        if (!Functions.inventoryListFunctions) {
            Functions.inventoryListFunctions = new InventoryListFunctions();
        }
        return Functions.inventoryListFunctions;
    }

    static task(): TaskFunctions {
        if (!Functions.taskFunctions) {
            Functions.taskFunctions = new TaskFunctions();
        }
        return Functions.taskFunctions;
    }

    static taskList(): TaskListFunctions {
        if (!Functions.taskListFunctions) {
            Functions.taskListFunctions = new TaskListFunctions();
        }
        return Functions.taskListFunctions;
    }

    static shopping(): ShoppingFunctions {
        if (!Functions.shoppingFunctions) {
            Functions.shoppingFunctions = new ShoppingFunctions();
        }
        return Functions.shoppingFunctions;
    }

    static room(): RoomFunctions {
        if (!Functions.roomFunctions) {
            Functions.roomFunctions = new RoomFunctions();
        }
        return Functions.roomFunctions;
    }

    static housing(): HousingFunctions {
        if (!Functions.housingFunctions) {
            Functions.housingFunctions = new HousingFunctions();
        }
        return Functions.housingFunctions;
    }
}
