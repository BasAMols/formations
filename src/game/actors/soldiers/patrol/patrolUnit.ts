import { Vec2 } from "planck";
import { RenderColor } from "../../../../engine/util/color.js";
import { Actor } from "../../../../engine/core/actor.js";
import { PhysicsController } from "../../../../engine/physics/physicsController.js";
import { CircleRenderer } from "../../../../engine/render/circleRenderer.js";
import { DisciplineController } from "../../../../engine/module/discipline/disciplineController.js";
import { PatrolDiscipline } from "./patrolDiscipline.js";

export class PatrolUnit extends Actor {
    constructor(x: number, y: number, waypoints: Vec2[]) {
        super({ position: new Vec2(x, y) });
        this.addController(new CircleRenderer(20, RenderColor.yellow()));
        this.addController(new PhysicsController(20, 1, 2));

        const discipline = new PatrolDiscipline({ waypoints });
        this.addController(new DisciplineController(discipline));
    }
}
