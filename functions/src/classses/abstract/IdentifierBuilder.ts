export abstract class IdentifierBuilder {
    id!: string;

    create() {
        this.id = ""
    }

    abstract build(): void;
}
