import { RenderColor } from "../../../library/engine/color.js";
import { Vector2 } from "../../../library/engine/math/vector2.js";
import { Discipline, type DisciplineInstance, type DisciplineProps } from "../discipline.js";
import type { Unit } from "../../unit.js";

const MOVE_SPEED = 1.5;
const ARRIVAL_THRESHOLD = 0;
const SLOT_SPACING = 15;

export interface FollowerInstance extends DisciplineInstance {
    readonly unit: Unit;
    leader: Unit | null;
    side: 'L' | 'R';
    depth: number;
}

export interface FollowerDisciplineProps extends DisciplineProps {
    getLeaders: () => Unit[];
    leaderDiscipline: Discipline<any> | null;
}

export class FollowerDiscipline extends Discipline<FollowerInstance> {
    readonly name = "follower";
    readonly order = 5;

    public props: FollowerDisciplineProps;

    constructor(props: FollowerDisciplineProps) {
        super();
        this.props = props;
    }

    addTarget(unit: Unit): void {
        const leftCount = this.units.filter(i => i.side === 'L').length;
        const rightCount = this.units.filter(i => i.side === 'R').length;
        const side: 'L' | 'R' = leftCount <= rightCount ? 'L' : 'R';
        const sideCount = side === 'L' ? leftCount : rightCount;

        super.addTarget(unit);

        const handler = this.getHandler(unit);
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
                l.transform.position.distance(instance.unit.transform.position) <
                closest.transform.position.distance(instance.unit.transform.position)
                    ? l : closest
            );
        }
    }

    protected orderTargets(targets: Unit[]): Unit[] {
        return targets.sort((a, b) => {
            const ha = this.getHandler(a);
            const hb = this.getHandler(b);
            return (ha?.depth ?? 0) - (hb?.depth ?? 0);
        });
    }

    create(unit: Unit): FollowerInstance {
        const discipline = this;
        return new (class implements FollowerInstance {
            readonly unit: Unit = unit;
            leader: Unit | null = null;
            side: 'L' | 'R' = 'L';
            depth: number = 1;

            execute(): void {
                if (!this.leader) {
                    discipline.props.leaderDiscipline?.assignUnit(this.unit);
                    return;
                }

                this.unit.color = RenderColor.blue();

                if (this.depth > 1) {
                    const aheadExists = discipline.units.some(
                        i => i.side === this.side && i.depth === this.depth - 1
                    );
                    if (!aheadExists) {
                        this.depth -= 1;
                    }
                }

                const x = (this.side === 'L' ? -1 : 1) * this.depth * SLOT_SPACING;
                const y = this.depth * SLOT_SPACING;
                const target = this.leader.transform.position.add(new Vector2(x, y));
                const delta = target.subtract(this.unit.transform.position);

                if (delta.magnitude() > ARRIVAL_THRESHOLD) {
                    this.unit.transform.relative.position(delta.clampMagnitude(0, MOVE_SPEED));
                }
            }
        })();
    }
}
