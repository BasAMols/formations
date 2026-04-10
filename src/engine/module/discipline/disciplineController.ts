import { Controller } from "../../controller/controller.js";
import type { Actor } from "../../core/actor.js";
import type { Discipline } from "./discipline.js";

export class DisciplineController extends Controller {
    readonly type = 'discipline';
    static readonly allowMultiple = false;

    constructor(public discipline: Discipline<any>) {
        super();
    }

    onDetach(actor: Actor): void {
        this.discipline.removeTarget(actor);
    }
}
