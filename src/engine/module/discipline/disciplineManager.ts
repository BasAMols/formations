import { LogicController } from "../../controller/logicController.js";
import type { Actor } from "../../core/actor.js";
import type { Discipline } from "./discipline.js";
import { DisciplineController } from "./disciplineController.js";

export class DisciplineManagerController extends LogicController {
    order = 1;
    private _tracked = new Map<Actor, DisciplineController>();

    tick(root: Actor): void {
        this.sync(root);
        this.runHierarchy(root.children);
    }

    private sync(root: Actor): void {
        const current = new Map<Actor, DisciplineController>();
        this.walk(root.children, current);

        for (const [actor, dc] of current) {
            if (this._tracked.has(actor)) continue;
            dc.discipline.addTarget(actor);
            this._tracked.set(actor, dc);
        }

        for (const [actor] of this._tracked) {
            if (!current.has(actor)) {
                this._tracked.delete(actor);
            }
        }
    }

    private walk(actors: Actor[], out: Map<Actor, DisciplineController>): void {
        for (const actor of actors) {
            if (!actor.alive) continue;
            const dc = actor.getControllers<DisciplineController>('discipline')[0];
            if (dc) {
                out.set(actor, dc);
            }
            this.walk(actor.children, out);
        }
    }

    private runHierarchy(actors: Actor[]): void {
        const seen = new Set<Discipline<any>>();
        const disciplines: Discipline<any>[] = [];

        for (const actor of actors) {
            const dc = actor.getControllers<DisciplineController>('discipline')[0];
            if (dc && !seen.has(dc.discipline)) {
                seen.add(dc.discipline);
                disciplines.push(dc.discipline);
            }
        }
        disciplines.sort((a, b) => a.order - b.order);

        for (const d of disciplines) {
            d.run((actor: Actor) => {
                if (actor.children.length > 0) this.runHierarchy(actor.children);
            });
        }

        for (const actor of actors) {
            const hasDC = actor.getControllers('discipline').length > 0;
            if (!hasDC && actor.children.length > 0) {
                this.runHierarchy(actor.children);
            }
        }
    }
}
