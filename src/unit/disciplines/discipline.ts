import type { Actor } from "../../library/engine/element.js";

export interface DisciplineProps {}

export interface DisciplineInstance {
    gatherData?(): void;
    execute(): void;
    dispose?(): void;
}

export abstract class Discipline<TInstance extends DisciplineInstance = DisciplineInstance> {
    abstract readonly name: string;
    abstract readonly order: number;

    private _handlers = new Map<Actor, TInstance>();

    constructor(_props: DisciplineProps = {}) {}

    get units(): TInstance[] { return [...this._handlers.values()]; }
    getTargets(): Actor[] { return [...this._handlers.keys()]; }

    protected getHandler(actor: Actor): TInstance | undefined {
        return this._handlers.get(actor);
    }

    abstract create(actor: Actor): TInstance;

    addTarget(actor: Actor): void {
        this._handlers.set(actor, this.create(actor));
    }

    removeTarget(actor: Actor): void {
        this._handlers.get(actor)?.dispose?.();
        this._handlers.delete(actor);
    }

    protected collectGlobalData(): void {}
    protected runGlobalActions(): void {}
    protected orderTargets(targets: Actor[]): Actor[] { return targets; }

    run(afterEach?: (actor: Actor) => void): void {
        this.collectGlobalData();
        this.runGlobalActions();
        const ordered = this.orderTargets(this.getTargets());
        for (const actor of ordered) {
            const h = this._handlers.get(actor);
            if (!h) continue;
            h.gatherData?.();
            h.execute();
            afterEach?.(actor);
        }
    }
}
