import { RenderColor } from "../../library/engine/color.js";
import type { Unit } from "../unit.js";
import { Discipline } from "./discipline.js";

export class FollowDiscipline extends Discipline {
    public target: Unit | undefined;
    constructor(target?: Unit) {
        super("follow", 2, RenderColor.blue());
        this.target = target;
    }

    execute(unit: Unit): void {
        super.execute(unit);
        if (!this.target) {
            return;
        }
        if (this.target.transform.position.distance(unit.transform.position) < 10) {
            return;
        }
        unit.transform.relative.position(this.target.transform.position.subtract(unit.transform.position).clampMagnitude(undefined, 0.5));
    }
}