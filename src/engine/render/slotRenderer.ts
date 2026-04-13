import { RenderColor } from "../util/color.js";
import { RenderController } from "../controller/renderController.js";
import type { Canvas } from "../util/dom/canvas.js";
import type { Actor } from "../core/actor.js";

const SLOT_COLOR = new RenderColor(0.6, 0.6, 0.6, 0.8);

export class SlotRenderer extends RenderController {
    constructor(
        public radius: number,
        public color: RenderColor = SLOT_COLOR,
        public lineWidth: number = 1,
    ) {
        super();
    }

    render(_actor: Actor, canvas: Canvas): void {
        canvas.ctx.setLineDash([3, 3]);
        canvas.ctx.strokeStyle = this.color.toString();
        canvas.ctx.lineWidth = this.lineWidth;
        canvas.ctx.beginPath();
        canvas.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        canvas.ctx.stroke();
        canvas.ctx.setLineDash([]);
    }
}
