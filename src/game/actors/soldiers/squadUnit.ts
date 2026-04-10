import { Vec2 } from "planck";
import { RenderColor } from "../../../engine/util/color.js";
import { Actor } from "../../../engine/core/actor.js";
import { PhysicsController } from "../../../engine/physics/physicsController.js";
import { CircleRenderer } from "../../../engine/render/circleRenderer.js";
import { DisciplineController } from "../../../engine/module/discipline/disciplineController.js";
import { LeaderDiscipline } from "./leader/leaderDiscipline.js";
import { FollowerDiscipline } from "./follower/followerDiscipline.js";

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

        const leaderPhysics = new PhysicsController(30, 10, 3);
        leaderPhysics.filterGroupIndex = groupIndex;

        const leader = new Actor({ position: new Vec2(x, y) });
        leader.addController(new CircleRenderer(30, RenderColor.green()));
        leader.addController(leaderPhysics);
        leader.addController(new DisciplineController(leaderDisc));
        this.append(leader);

        for (let i = 0; i < 8; i++) {
            const followerPhysics = new PhysicsController(30, 1, 3);
            followerPhysics.filterGroupIndex = groupIndex;

            const f = new Actor({ position: new Vec2(x, y + i * 70 + 70) });
            f.addController(new CircleRenderer(30, RenderColor.blue()));
            f.addController(followerPhysics);
            f.addController(new DisciplineController(followerDisc));
            this.append(f);
        }
    }
}
