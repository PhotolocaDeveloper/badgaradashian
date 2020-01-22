import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";
import {Helper} from "../../classses/helpers/Helper";
import WriteBatch = admin.firestore.WriteBatch;
import DocumentReference = admin.firestore.DocumentReference;

export class CountableFunctions {
    update<T>(type: new (...params: Array<any>) => T, snapshot: DocumentSnapshot, refField: string, counterField: string): CounterUpdater<T> {
        return new CounterUpdater(type, snapshot, refField, counterField)
    }

    move<T>(
        type: new (...params: Array<any>) => T,
        snapshotFrom: DocumentSnapshot,
        snapshotTo: DocumentSnapshot,
        refField: string,
        counterField: string): CounterMover<T> {
        return new CounterMover(type, snapshotFrom, snapshotTo, refField, counterField)
    }

    multiplyUpdate<T>(
        type: new (...params: Array<any>) => T,
        refField: string,
        counterField: string): MultiplyCounterUpdater<T> {
        return new MultiplyCounterUpdater(type, refField, counterField)
    }
}

class CounterUpdater<T> {

    private batch?: WriteBatch;
    private condition?: (value: T) => boolean;

    constructor(
        private type: new (...params: Array<any>) => T,
        private snapshot: DocumentSnapshot,
        private refField: string,
        private counterField: string
    ) {
    }

    increment(count: number = 1): WriteBatch {
        return this.update(count)
    }

    decrement(count: number = 1): WriteBatch {
        return this.update(-count)
    }

    setBatch(batch: WriteBatch): CounterUpdater<T> {
        this.batch = batch;
        return this
    }

    setCondition(condition: (value: T) => boolean): CounterUpdater<T> {
        this.condition = condition;
        return this
    }

    private update(count: number): WriteBatch {
        const batch = this.batch || admin.firestore().batch();
        if (!this.isConditionTrue()) return batch;
        const ref: DocumentReference | null | undefined = this.snapshot.get(this.refField);
        if (!ref) return batch;
        return Helper.firestore().incrementFieldWithBatch(batch, ref, this.counterField, count);
    }

    private isConditionTrue(): boolean {
        if (!this.condition) return true;
        const value = Helper.firestore().deserialize(this.snapshot, this.type)!;
        return this.condition(value)
    }

}

class MultiplyCounterUpdater<T> {

    private batch?: WriteBatch;
    private condition?: (values: T[]) => UpdateMethod[] | null;

    private snapshots: DocumentSnapshot[] = [];

    constructor(
        private type: new (...params: Array<any>) => T,
        private refField: string,
        private counterField: string
    ) {
    }

    update(count: number = 1): WriteBatch {
        const batch = this.batch || admin.firestore().batch();
        const methods = this.updateMethods();
        this.snapshots.forEach((snapshot, index) => {
            if (methods.length - 1 < index) return;
            this.updateCounter(batch, snapshot, methods[index], count)
        });
        return batch;
    }

    setBatch(batch: WriteBatch): MultiplyCounterUpdater<T> {
        this.batch = batch;
        return this
    }

    setConditions(condition: (values: T[]) => UpdateMethod[] | null): MultiplyCounterUpdater<T> {
        this.condition = condition;
        return this
    }

    setSnapshots(snapshots: DocumentSnapshot[]) {
        this.snapshots = snapshots;
        return this;
    }

    private updateMethods(): UpdateMethod[] {
        if (!this.condition) return [];
        const values: T[] = this.snapshots
            .map(snapshot => {
                return Helper.firestore().deserialize(snapshot, this.type)
            })
            .filter(data => data !== undefined)
            .map(data => data!);
        return this.condition(values) || []
    }

    private updateCounter(batch: WriteBatch, snapshot: DocumentSnapshot, method: UpdateMethod, count: number) {
        const ref: DocumentReference | null | undefined = snapshot.get(this.refField);
        if (!ref) return;
        switch (method) {
            case UpdateMethod.Decrement:
                Helper.firestore().decrementFieldWithBatch(batch, ref, this.counterField, count);
                break;
            case UpdateMethod.Increment:
                Helper.firestore().incrementFieldWithBatch(batch, ref, this.counterField, count);
                break;
            case UpdateMethod.None:
                return;
        }
    }
}

export enum UpdateMethod {
    Increment,
    Decrement,
    None
}


class CounterMover<T> {

    private batch?: WriteBatch;
    private condition?: (from: T, to: T) => boolean;

    constructor(
        private type: new (...params: Array<any>) => T,
        private snapFrom: DocumentSnapshot,
        private snapTo: DocumentSnapshot,
        private refField: string,
        private counterField: string
    ) {
    }

    move(count: number = 1) {
        const batch = this.batch || admin.firestore().batch();
        if (!this.isConditionTrue()) return batch;
        new CounterUpdater(this.type, this.snapFrom, this.refField, this.counterField)
            .setBatch(batch).decrement(count);
        new CounterUpdater(this.type, this.snapTo, this.refField, this.counterField)
            .setBatch(batch).increment(count);
        return batch;
    }

    setBatch(batch: WriteBatch): CounterMover<T> {
        this.batch = batch;
        return this
    }

    setCondition(condition: (valueFrom: T, valueTo: T) => boolean): CounterMover<T> {
        this.condition = condition;
        return this
    }

    private isConditionTrue(): boolean {
        if (!this.condition) return true;
        const valueFrom = Helper.firestore().deserialize(this.snapFrom, this.type)!;
        const valueTo = Helper.firestore().deserialize(this.snapTo, this.type)!;
        return this.condition(valueFrom, valueTo)
    }

}
