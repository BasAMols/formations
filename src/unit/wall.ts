import { Vec2 } from "planck";
import { RenderColor } from "../library/engine/color.js";
import { Actor } from "../library/engine/element.js";
import { StaticPhysicsController } from "../library/engine/physics.js";
import { RectRenderer } from "./renderers.js";

export class Wall extends Actor {
    constructor(x: number, y: number, width: number, height: number, color: RenderColor = RenderColor.gray()) {
        super({ position: new Vec2(x, y) });
        this.addController(new RectRenderer(width, height, color));
        this.addController(new StaticPhysicsController(width, height));
    }
}
