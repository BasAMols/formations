import { RenderColor } from "../util/color.js";
import { RenderController } from "../controller/renderController.js";
import type { Canvas } from "../util/dom/canvas.js";
import type { Actor } from "../core/actor.js";

export class OutlineRenderer extends RenderController {
    constructor(
        public width: number,
        public height: number,
        public color: RenderColor = RenderColor.white(),
        public lineWidth: number = 1,
        public dashed: boolean = false,
    ) {
        super();
    }

    render(_actor: Actor, canvas: Canvas): void {
        const x = -this.width / 2;
        const y = -this.height / 2;
        if (this.dashed) canvas.ctx.setLineDash([6, 4]);
        canvas.ctx.strokeStyle = this.color.toString();
        canvas.ctx.lineWidth = this.lineWidth;
        canvas.ctx.strokeRect(x, y, this.width, this.height);
        if (this.dashed) canvas.ctx.setLineDash([]);
    }
}
