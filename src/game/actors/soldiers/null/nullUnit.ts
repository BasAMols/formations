import { Vec2 } from "planck";
import { RenderColor } from "../../../../engine/util/color.js";
import { Actor } from "../../../../engine/core/actor.js";
import { PhysicsController } from "../../../../engine/physics/physicsController.js";
import { CircleRenderer } from "../../../../engine/render/circleRenderer.js";
import { DisciplineController } from "../../../../engine/module/discipline/disciplineController.js";
import { NullDiscipline } from "./nullDiscipline.js";

export class NullUnit extends Actor {
    constructor(x: number, y: number) {
        super({ position: new Vec2(x, y) });
        this.addController(new CircleRenderer(40, RenderColor.red()));
        this.addController(new PhysicsController(40, 1, 5));
        this.addController(new DisciplineController(new NullDiscipline()));
    }
}
