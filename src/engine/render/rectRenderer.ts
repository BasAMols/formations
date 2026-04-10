import { Vec2 } from "planck";
import { RenderColor } from "../util/color.js";
import { RenderController } from "../controller/renderController.js";
import type { Canvas } from "../util/dom/canvas.js";
import type { Actor } from "../core/actor.js";

export class RectRenderer extends RenderController {
    constructor(public width: number, public height: number, public color: RenderColor = RenderColor.white()) {
        super();
    }

    render(_actor: Actor, canvas: Canvas): void {
        canvas.draw.rect(new Vec2(-this.width / 2, -this.height / 2), new Vec2(this.width, this.height), this.color);
    }
}
