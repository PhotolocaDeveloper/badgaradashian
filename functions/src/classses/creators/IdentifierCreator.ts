import {IdentifierBuilder} from "../abstract/IdentifierBuilder";

export class IdentifierCreator {

    constructor(
        private builder: IdentifierBuilder
    ) {
    }

    get(): string {
        return this.builder.id
    }

    construct() {
        this.builder.create();
        this.builder.build()
    }

}
