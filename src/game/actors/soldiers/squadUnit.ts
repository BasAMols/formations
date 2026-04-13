import { Vec2 } from "planck";
import { Actor } from "../../../engine/core/actor.js";
import { PhysicsController } from "../../../engine/physics/physicsController.js";
import { DisciplineController } from "../../../engine/module/discipline/disciplineController.js";
import { SoldierRenderer } from "./soldierRenderer.js";
import { LeaderDiscipline } from "./leader/leaderDiscipline.js";
import { FollowerDiscipline } from "./follower/followerDiscipline.js";
import { SoldierUnit } from "./soldierUnit.js";

export class Squad extends Actor {
    private static _nextGroupId = -1;

    constructor(x: number, y: number) {
        super({ position: new Vec2(x, y) });

        const groupIndex = Squad._nextGroupId--;

        const followerDisc = new FollowerDiscipline({
            getLeaders: () => leaderDisc.getTargets(),
            leaderDiscipline: null,
        });
        const leaderDisc = new LeaderDiscipline({ followerDiscipline: followerDisc });
        followerDisc.props.leaderDiscipline = leaderDisc;

        this.append(new SoldierUnit(x, y, 30, groupIndex, new DisciplineController(leaderDisc)));

        for (let i = 0; i < 4; i++) {
            this.append(new SoldierUnit(x, y + i * 70 + 70, 30, groupIndex, new DisciplineController(followerDisc)));
        }
    }
}
