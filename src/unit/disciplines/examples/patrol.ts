import { Vec2 } from "planck";
import { RenderColor } from "../../../library/engine/color.js";
import { Actor } from "../../../library/engine/element.js";
import { PhysicsController } from "../../../library/engine/physics.js";
import { CircleRenderer } from "../../renderers.js";
import { Discipline, type DisciplineInstance, type DisciplineProps } from "../discipline.js";
import { DisciplineController } from "../controller.js";

const PATROL_SPEED = 100;
const PATROL_ACCEL = 0.08;

export interface PatrolDisciplineProps extends DisciplineProps {
    waypoints: Vec2[];
}

export class PatrolDiscipline extends Discipline {
    readonly name = "patrol";
    readonly order = 3;

    constructor(private patrolProps: PatrolDisciplineProps) {
        super(patrolProps);
    }

    create(actor: Actor): DisciplineInstance {
        const props = this.patrolProps;
        const physics = actor.getControllers<PhysicsController>('physics')[0];
        let waypointIdx = 0;
        const ARRIVAL_THRESHOLD = 30;

        return {
            execute(): void {
                if (!physics) return;

                if (!physics.hasPath) {
                    const target = props.waypoints[waypointIdx % props.waypoints.length];
                    const dist = Vec2.sub(target, physics.getPosition()).length();
                    if (dist < ARRIVAL_THRESHOLD) {
                        waypointIdx++;
                    }
                    physics.moveTo(props.waypoints[waypointIdx % props.waypoints.length]);
                }

                physics.tick(PATROL_SPEED, PATROL_ACCEL);
            },
        };
    }
}

export class PatrolUnit extends Actor {
    constructor(x: number, y: number, waypoints: Vec2[]) {
        super({ position: new Vec2(x, y) });
        this.addController(new CircleRenderer(20, RenderColor.yellow()));
        this.addController(new PhysicsController(20, 1, 2));

        const discipline = new PatrolDiscipline({ waypoints });
        this.addController(new DisciplineController(discipline));
    }
}
