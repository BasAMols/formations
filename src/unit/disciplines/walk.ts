import { RenderColor } from "../../library/engine/color.js";
import type { Unit } from "../unit.js";
import { Discipline } from "./discipline.js";

export class WalkDiscipline extends Discipline {
    constructor() {
        super("walk", 1, RenderColor.green());
    }

    execute(unit: Unit): void {
        super.execute(unit);
        unit.transform.position.y -= 0.5;
        if (unit.transform.position.y < 0) {
            unit.transform.position.y = $.canvas.size.y;
        }
    }
}