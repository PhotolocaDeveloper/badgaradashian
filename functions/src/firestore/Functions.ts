import {GeneralFunctions} from "./functions/GeneralFunctions";
import {InventoryFunctions} from "./functions/InventoryFunctions";
import {CaseToDoFunctions} from "./functions/CaseToDoFunctions";
import {ShoppingFunctions} from "./functions/ShoppingFunctions";
import {RoomFunctions} from "./functions/RoomFunctions";
import {HousingFunctions} from "./functions/HousingFunctions";

export class Functions {

    private static generalFunctions: GeneralFunctions;
    private static inventoryFunctions: InventoryFunctions;
    private static caseToDoFunctions: CaseToDoFunctions;
    private static shoppingFunctions: ShoppingFunctions;
    private static roomFunctions: RoomFunctions;
    private static housingFunctions: HousingFunctions;

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

    static caseToDo(): CaseToDoFunctions {
        if (!Functions.caseToDoFunctions) {
            Functions.caseToDoFunctions = new CaseToDoFunctions();
        }
        return Functions.caseToDoFunctions;
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
