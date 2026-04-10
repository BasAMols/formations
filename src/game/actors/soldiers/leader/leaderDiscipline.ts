import { Vec2 } from "planck";
import { Actor } from "../../../../engine/core/actor.js";
import { PhysicsController } from "../../../../engine/physics/physicsController.js";
import { Discipline, type DisciplineInstance, type DisciplineProps } from "../../../../engine/module/discipline/discipline.js";
import type { FollowerDiscipline } from "../follower/followerDiscipline.js";

const SPEED = 400;
const LEADER_ACCEL = 0.05;
const ARRIVAL_THRESHOLD = 30;

export interface LeaderDisciplineProps extends DisciplineProps {
    followerDiscipline: FollowerDiscipline;
}

export class LeaderDiscipline extends Discipline {
    readonly name = "leader";
    readonly order = 0;
    public facing: number = 0;

    constructor(private leaderProps: LeaderDisciplineProps) {
        super(leaderProps);
    }

    create(actor: Actor): DisciplineInstance {
        const discipline = this;
        const physics = actor.getControllers<PhysicsController>('physics')[0];
        const waypoints = [new Vec2(200, 780), new Vec2(2900, 780)];
        let waypointIdx = 0;

        return new (class implements DisciplineInstance {
            execute(): void {
                if (!physics) return;

                if (!physics.hasPath) {
                    const target = waypoints[waypointIdx % waypoints.length];
                    const dist = Vec2.sub(target, physics.getPosition()).length();
                    if (dist < ARRIVAL_THRESHOLD) {
                        waypointIdx++;
                    }
                    physics.moveTo(waypoints[waypointIdx % waypoints.length]);
                }
                physics.tick(SPEED, LEADER_ACCEL);

                const vel = physics.getVelocity();
                if (vel.length() > 1) {
                    discipline.facing = Math.atan2(vel.y, vel.x);
                }

                const followers = discipline.leaderProps.followerDiscipline.units;
                const left = followers.filter(f => f.side === 'L').length;
                const right = followers.filter(f => f.side === 'R').length;
                const diff = right - left;

                if (Math.abs(diff) >= 2) {
                    const fromSide = diff > 0 ? 'R' : 'L';
                    const toSide = diff > 0 ? 'L' : 'R';
                    const x = Math.floor(Math.abs(diff) / 2);

                    const movers = followers
                        .filter(f => f.side === fromSide)
                        .sort((a, b) => a.depth - b.depth)
                        .slice(0, x);

                    movers.forEach(f => { f.side = toSide; f.depth += 0.5; });

                    for (const side of ['L', 'R'] as const) {
                        followers
                            .filter(f => f.side === side)
                            .sort((a, b) => a.depth - b.depth)
                            .forEach((f, i) => { f.depth = i + 1; });
                    }
                }
            }
        })();
    }
}
