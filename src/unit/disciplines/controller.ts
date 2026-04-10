import { Controller } from "../../library/engine/controller.js";
import type { Actor } from "../../library/engine/element.js";
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
