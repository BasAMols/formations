import { Vec2 } from "planck";
import { RenderColor } from "../../../library/engine/color.js";
import { Actor } from "../../../library/engine/element.js";
import { PhysicsController } from "../../../library/engine/physics.js";
import { CircleRenderer } from "../../renderers.js";
import { Discipline, type DisciplineInstance } from "../discipline.js";
import { DisciplineController } from "../controller.js";

export class NullDiscipline extends Discipline {
    readonly name = "null";
    readonly order = 10;

    create(_actor: Actor): DisciplineInstance {
        return {
            execute() {},
        };
    }
}

export class NullUnit extends Actor {
    constructor(x: number, y: number) {
        super({ position: new Vec2(x, y) });
        this.addController(new CircleRenderer(40, RenderColor.red()));
        this.addController(new PhysicsController(40, 1, 5));
        this.addController(new DisciplineController(new NullDiscipline()));
    }
}
