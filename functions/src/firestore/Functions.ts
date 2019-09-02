import {GeneralFunctions} from "./functions/GeneralFunctions";
import {InventoryFunctions} from "./functions/InventoryFunctions";
import {CaseToDoFunctions} from "./functions/CaseToDoFunctions";

export class Functions {
    private static generalFunctions: GeneralFunctions;
    private static inventoryFunctions: InventoryFunctions;
    private static caseToDoFunctions: CaseToDoFunctions;

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
}
