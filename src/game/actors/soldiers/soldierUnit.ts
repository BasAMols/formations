import { Vec2 } from "planck";
import { Actor } from "../../../engine/core/actor.js";
import { SoldierRenderer } from "./soldierRenderer.js";
import { PhysicsController } from "../../../engine/physics/physicsController.js";
import type { DisciplineController } from "../../../engine/module/discipline/disciplineController.js";

const SOLDIER_SIZE = 200;

export class SoldierUnit extends Actor {
    constructor(x: number, y: number, density: number, groupIndex: number, discplineController: DisciplineController) {
        super({ position: new Vec2(x, y) });

        this.addController(new SoldierRenderer(SOLDIER_SIZE, SOLDIER_SIZE, new Vec2(10, 20)))
        this.addController(new PhysicsController(density, 10, 3, groupIndex));
        this.addController(discplineController);

    }
}