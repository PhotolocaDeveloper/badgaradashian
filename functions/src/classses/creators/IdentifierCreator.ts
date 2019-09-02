import {IdentifierBuilder} from "../abstract/IdentifierBuilder";
import {Md5} from "md5-typescript";

export class IdentifierCreator {

    constructor(
        private builder: IdentifierBuilder
    ) {
    }

    get(): string {
        return Md5.init(this.builder.id)
    }

    construct() {
        this.builder.create();
        this.builder.build()
    }

}
