import { Vec2 } from "planck";
import { RenderColor } from "../library/engine/color.js";
import { RenderController } from "../library/engine/controller.js";
import type { Canvas } from "../library/engine/dom/canvas.js";
import type { Actor } from "../library/engine/element.js";

export class CircleRenderer extends RenderController {
    constructor(public radius: number, public color: RenderColor = RenderColor.white()) {
        super();
    }

    render(_actor: Actor, canvas: Canvas): void {
        canvas.draw.circle(Vec2.zero(), this.radius, this.color);
    }
}

export class RectRenderer extends RenderController {
    constructor(public width: number, public height: number, public color: RenderColor = RenderColor.white()) {
        super();
    }

    render(_actor: Actor, canvas: Canvas): void {
        canvas.draw.rect(new Vec2(-this.width / 2, -this.height / 2), new Vec2(this.width, this.height), this.color);
    }
}
