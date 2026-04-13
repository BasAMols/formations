import { RenderColor } from "../util/color.js";
import { RenderController } from "../controller/renderController.js";
import type { Canvas } from "../util/dom/canvas.js";
import type { Actor } from "../core/actor.js";

const OBJECT_COLOR = new RenderColor(0.55, 0.5, 0.45, 0.8);

export class ObjectRenderer extends RenderController {
    constructor(
        public size: number,
        public color: RenderColor = OBJECT_COLOR,
        public lineWidth: number = 1,
    ) {
        super();
    }

    render(_actor: Actor, canvas: Canvas): void {
        const half = this.size / 2;
        canvas.ctx.strokeStyle = this.color.toString();
        canvas.ctx.lineWidth = this.lineWidth;
        canvas.ctx.strokeRect(-half, -half, this.size, this.size);
    }
}
