import { RenderColor } from "../library/engine/color.js";
import type { Canvas } from "../library/engine/dom/canvas.js";
import { Actor } from "../library/engine/element.js";
import { Vector2 } from "../library/engine/math/vector2.js";
import type { Discipline } from "./disciplines/discipline.js";

export class Unit extends Actor {
    activeDiscipline: string;
    color: RenderColor = RenderColor.white();
    constructor(x: number, discipline?: Discipline) {
        super({
            size: new Vector2(10, 10),
        });
        this.transform.position.x = x;
        if (discipline) {
            this.activeDiscipline = discipline.name;
            discipline.addTarget(this);
        }
    }

    render(canvas: Canvas): void {
        canvas.draw.rect(this.transform.position, this.transform.size, this.color);
    }
}