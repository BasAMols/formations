import { RenderColor } from "../library/engine/color.js";
import type { Canvas } from "../library/engine/dom/canvas.js";
import { Actor } from "../library/engine/element.js";
import { Vector2 } from "../library/engine/math/vector2.js";
import type { Discipline } from "./disciplines/discipline.js";
import { LeaderDiscipline } from "./disciplines/examples/leader.js";
import { FollowerDiscipline } from "./disciplines/examples/follower.js";
import { Unit } from "./unit.js";

const UNIT_COUNT = 10;
const LEADER_COUNT = 2;

export class Game extends Actor {
    private units: Unit[] = [];

    constructor() {
        super();

        const followerDiscipline = new FollowerDiscipline({
            getLeaders: () => leaderDiscipline.getTargets(),
            leaderDiscipline: null,
        });

        const leaderDiscipline = new LeaderDiscipline({
            followerDiscipline,
        });

        followerDiscipline.props.leaderDiscipline = leaderDiscipline;

        for (let i = 0; i < UNIT_COUNT; i++) {
            const unit = this.append(new Unit(60 * i)) as Unit;
            this.units.push(unit);
            unit.assignDiscipline(i < LEADER_COUNT ? leaderDiscipline : followerDiscipline);
        }
    }

    render(canvas: Canvas): void {
        super.render(canvas);
        canvas.draw.rect(Vector2.zero(), canvas.size, RenderColor.black());
    }

    tick(): void {
        super.tick();
        this.units = this.units.filter(u => u.alive);

        const seen = new Set<Discipline<any>>();
        const disciplines: Discipline<any>[] = [];
        for (const unit of this.units) {
            if (unit.discipline && !seen.has(unit.discipline)) {
                seen.add(unit.discipline);
                disciplines.push(unit.discipline);
            }
        }
        disciplines.sort((a, b) => a.order - b.order).forEach(d => d.run());
    }
}
