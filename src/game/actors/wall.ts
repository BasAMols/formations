import { Vec2 } from "planck";
import { RenderColor } from "../../engine/util/color.js";
import { Actor } from "../../engine/core/actor.js";
import { StaticPhysicsController } from "../../engine/physics/staticPhysicsController.js";
import { RectRenderer } from "../../engine/render/rectRenderer.js";

export class Wall extends Actor {
    constructor(x: number, y: number, width: number, height: number, color: RenderColor = RenderColor.gray()) {
        super({ position: new Vec2(x, y) });
        this.addController(new RectRenderer(width, height, color));
        this.addController(new StaticPhysicsController(width, height));
    }
}
