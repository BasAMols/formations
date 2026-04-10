import { Vec2 } from "planck";
import { RenderColor } from "../util/color.js";
import { RenderController } from "../controller/renderController.js";
import type { Canvas } from "../util/dom/canvas.js";
import type { Actor } from "../core/actor.js";

export class CircleRenderer extends RenderController {
    constructor(public radius: number, public color: RenderColor = RenderColor.white()) {
        super();
    }

    render(_actor: Actor, canvas: Canvas): void {
        canvas.draw.circle(Vec2.zero(), this.radius, this.color);
    }
}
