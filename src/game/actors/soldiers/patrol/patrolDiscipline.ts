import { Vec2 } from "planck";
import { Actor } from "../../../../engine/core/actor.js";
import { PhysicsController } from "../../../../engine/physics/physicsController.js";
import { Discipline, type DisciplineInstance, type DisciplineProps } from "../../../../engine/module/discipline/discipline.js";

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
