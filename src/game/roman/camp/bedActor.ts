import { Vec2 } from "planck";
import { Actor } from "../../../engine/core/actor.js";
import { RenderColor } from "../../../engine/util/color.js";
import { RectRenderer } from "../../../engine/render/rectRenderer.js";
import { SlotRenderer } from "../../../engine/render/slotRenderer.js";

const BED_COLOR = new RenderColor(0.5, 0.15, 0.1, 0.6);
const BED_WIDTH = 0.6;
const BED_LENGTH = 1.8;

export class BedActor extends Actor {
    constructor(x: number, y: number, angle: number, scale: number) {
        super({ position: new Vec2(x, y), angle });

        const w = BED_WIDTH * scale;
        const h = BED_LENGTH * scale;
        this.addController(new RectRenderer(w, h, BED_COLOR));

        const slot = new Actor();
        slot.addController(new SlotRenderer(0.06 * scale));
        this.append(slot);
    }
}
