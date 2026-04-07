import { RenderColor } from "../../../library/engine/color.js";
import { Discipline, type DisciplineInstance, type DisciplineProps } from "../discipline.js";
import type { Unit } from "../../unit.js";
import type { FollowerDiscipline } from "./follower.js";

export interface LeaderDisciplineProps extends DisciplineProps {
    followerDiscipline: FollowerDiscipline;
}

export class LeaderDiscipline extends Discipline {
    readonly name = "leader";
    readonly order = 0;

    constructor(private leaderProps: LeaderDisciplineProps) {
        super();
    }

    create(unit: Unit): DisciplineInstance {
        const discipline = this;
        return new (class implements DisciplineInstance {
            constructor(private unit: Unit) {}

            execute(): void {
                this.unit.color = RenderColor.green();
                this.unit.transform.position.y -= 0.5;
                if (this.unit.transform.position.y < 0) {
                    this.unit.transform.position.y = $.canvas.size.y;
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
        })(unit);
    }
}
