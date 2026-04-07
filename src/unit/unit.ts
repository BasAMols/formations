import { RenderColor } from "../library/engine/color.js";
import type { Canvas } from "../library/engine/dom/canvas.js";
import { Actor } from "../library/engine/element.js";
import { Vector2 } from "../library/engine/math/vector2.js";
import type { Discipline } from "./disciplines/discipline.js";

export class Unit extends Actor {
    order: number = 0;
    discipline: Discipline<any> | null = null;
    units: Unit[] = [];
    parent: Unit | null = null;
    color: RenderColor = RenderColor.white();

    constructor(x: number = 0, y: number = 0) {
        super({ size: new Vector2(10, 10) });
        this.transform.position.x = x;
        this.transform.position.y = y;
    }

    assignDiscipline(discipline: Discipline<any> | null): void {
        this.discipline?.removeTarget(this);
        this.discipline = discipline;
        discipline?.addTarget(this);
    }

    add(child: Unit): void {
        child.parent?.remove(child);
        this.units.push(child);
        child.parent = this;
    }

    remove(child: Unit): void {
        child.assignDiscipline(null);
        this.units = this.units.filter(u => u !== child);
        child.parent = null;
    }

    collectData(): void {}

    // Discipline system drives logic — opt out of Actor tick propagation
    gameTick(): void {}

    destroy(): void {
        this.assignDiscipline(null);
        this.parent?.remove(this);
        super.destroy();
    }

    render(canvas: Canvas): void {
        canvas.draw.rect(this.transform.position, this.transform.size, this.color);
    }
}
