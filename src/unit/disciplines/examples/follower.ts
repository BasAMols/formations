import { Vec2 } from "planck";
import { PhysicsController } from "../../../library/engine/physics.js";
import type { Actor } from "../../../library/engine/element.js";
import { Discipline, type DisciplineInstance, type DisciplineProps } from "../discipline.js";
import { DisciplineController } from "../controller.js";
import type { LeaderDiscipline } from "./leader.js";

const MAX_SPEED = 100;
const ACCEL = 0.05;
const SLOT_SPACING = 70;
const MIN_PATHFIND_DIST = 40;
const DEST_DRIFT_THRESHOLD = 80;

export interface FollowerInstance extends DisciplineInstance {
    readonly actor: Actor;
    leader: Actor | null;
    side: 'L' | 'R';
    depth: number;
}

export interface FollowerDisciplineProps extends DisciplineProps {
    getLeaders: () => Actor[];
    leaderDiscipline: Discipline<any> | null;
}

export class FollowerDiscipline extends Discipline<FollowerInstance> {
    readonly name = "follower";
    readonly order = 5;

    public props: FollowerDisciplineProps;

    constructor(props: FollowerDisciplineProps) {
        super(props);
        this.props = props;
    }

    addTarget(actor: Actor): void {
        const leftCount = this.units.filter(i => i.side === 'L').length;
        const rightCount = this.units.filter(i => i.side === 'R').length;
        const side: 'L' | 'R' = leftCount <= rightCount ? 'L' : 'R';
        const sideCount = side === 'L' ? leftCount : rightCount;

        super.addTarget(actor);

        const handler = this.getHandler(actor);
        if (handler) {
            handler.side = side;
            handler.depth = sideCount + 1;
        }
    }

    protected collectGlobalData(): void {
        const leaders = this.props.getLeaders();
        const leaderSet = new Set(leaders);

        for (const instance of this.units) {
            if (instance.leader !== null && !leaderSet.has(instance.leader)) {
                instance.leader = null;
            }
        }

        for (const instance of this.units) {
            if (instance.leader !== null || leaders.length === 0) continue;
            instance.leader = leaders.reduce((closest, l) =>
                Vec2.distance(l.position, instance.actor.position) <
                Vec2.distance(closest.position, instance.actor.position)
                    ? l : closest
            );
        }
    }

    protected orderTargets(targets: Actor[]): Actor[] {
        return targets.sort((a, b) => {
            const ha = this.getHandler(a);
            const hb = this.getHandler(b);
            return (ha?.depth ?? 0) - (hb?.depth ?? 0);
        });
    }

    create(actor: Actor): FollowerInstance {
        const discipline = this;
        const physics = actor.getControllers<PhysicsController>('physics')[0];

        return new (class implements FollowerInstance {
            readonly actor: Actor = actor;
            leader: Actor | null = null;
            side: 'L' | 'R' = 'L';
            depth: number = 1;
            private lastPathTarget: Vec2 | null = null;

            execute(): void {
                if (!this.leader) {
                    const dc = this.actor.getControllers<DisciplineController>('discipline')[0];
                    if (dc) this.actor.removeController(dc);

                    const leaderDisc = discipline.props.leaderDiscipline;
                    if (leaderDisc) {
                        this.actor.addController(new DisciplineController(leaderDisc));
                    }
                    return;
                }

                if (this.depth > 1) {
                    const aheadExists = discipline.units.some(
                        i => i.side === this.side && i.depth === this.depth - 1
                    );
                    if (!aheadExists) {
                        this.depth -= 1;
                    }
                }

                const localX = (this.side === 'L' ? -1 : 1) * this.depth * SLOT_SPACING;
                const localY = this.depth * SLOT_SPACING;

                const leaderDisc = discipline.props.leaderDiscipline as LeaderDiscipline | null;
                const facing = leaderDisc?.facing ?? 0;
                const cos = Math.cos(facing);
                const sin = Math.sin(facing);
                const worldX = -localX * sin - localY * cos;
                const worldY =  localX * cos - localY * sin;

                const leaderPos = this.leader.position;
                const rawTarget = new Vec2(leaderPos.x + worldX, leaderPos.y + worldY);

                if (!physics) return;

                const target = physics.isWalkable(rawTarget)
                    ? rawTarget
                    : physics.findNearestWalkable(rawTarget);

                const dist = Vec2.sub(target, physics.getPosition()).length();

                if (dist < MIN_PATHFIND_DIST) {
                    physics.moveToDirect(target, MAX_SPEED, ACCEL);
                    return;
                }

                let needsPath = false;
                if (physics.isInContact()) {
                    needsPath = true;
                } else if (this.lastPathTarget) {
                    if (Vec2.sub(this.lastPathTarget, target).length() > DEST_DRIFT_THRESHOLD) {
                        needsPath = true;
                    }
                } else {
                    needsPath = true;
                }

                if (needsPath) {
                    physics.moveTo(target);
                    this.lastPathTarget = Vec2.clone(target);
                }

                if (physics.hasPath) {
                    physics.tick(MAX_SPEED, ACCEL);
                } else {
                    physics.moveToDirect(target, MAX_SPEED, ACCEL);
                }
            }
        })();
    }
}
