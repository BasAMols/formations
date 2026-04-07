import type { Unit } from "../unit.js";
import { RenderColor } from "../../library/engine/color.js";

export class Discipline {

    targets: Unit[] = [];
    constructor(public readonly name: string, public readonly priority: number, public readonly color: RenderColor) {
    }

    run() {
        this.targets.forEach(target => {
            this.execute(target);
        });
    }

    addTarget(unit: Unit) {
        this.targets.push(unit);
    }

    removeTarget(unit: Unit) {
        this.targets = this.targets.filter(target => target !== unit);
    }

    execute(unit: Unit): void {
        unit.color = this.color;
    }
}