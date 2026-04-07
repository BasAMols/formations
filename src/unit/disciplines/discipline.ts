import type { Unit } from "../unit.js";

export interface DisciplineProps {}

export interface DisciplineInstance {
    gatherData?(): void;
    execute(): void;
    dispose?(): void;
}

export abstract class Discipline<TInstance extends DisciplineInstance = DisciplineInstance> {
    abstract readonly name: string;
    abstract readonly order: number;

    private _handlers = new Map<Unit, TInstance>();

    get units(): TInstance[] { return [...this._handlers.values()]; }
    getTargets(): Unit[] { return [...this._handlers.keys()]; }

    protected getHandler(unit: Unit): TInstance | undefined {
        return this._handlers.get(unit);
    }

    abstract create(unit: Unit): TInstance;

    addTarget(unit: Unit): void {
        this._handlers.set(unit, this.create(unit));
    }

    removeTarget(unit: Unit): void {
        this._handlers.get(unit)?.dispose?.();
        this._handlers.delete(unit);
    }

    assignUnit(unit: Unit): void {
        unit.assignDiscipline(this);
    }

    protected collectGlobalData(): void {}
    protected runGlobalActions(): void {}
    protected orderTargets(targets: Unit[]): Unit[] { return targets; }

    protected tickChildren(unit: Unit): void {
        unit.collectData();
        const seen = new Set<Discipline<any>>();
        const childDisciplines: Discipline<any>[] = [];
        for (const child of unit.units) {
            if (child.discipline && !seen.has(child.discipline)) {
                seen.add(child.discipline);
                childDisciplines.push(child.discipline);
            }
        }
        childDisciplines.sort((a, b) => a.order - b.order).forEach(d => d.run());
    }

    run(): void {
        this.collectGlobalData();
        this.runGlobalActions();
        const ordered = this.orderTargets(this.getTargets());
        for (const unit of ordered) {
            const h = this._handlers.get(unit);
            if (!h) continue;
            h.gatherData?.();
            h.execute();
            this.tickChildren(unit);
        }
    }
}
