import { RenderColor } from "../library/engine/color.js";
import type { Canvas } from "../library/engine/dom/canvas.js";
import { Actor } from "../library/engine/element.js";
import { Vector2 } from "../library/engine/math/vector2.js";
import { DisciplineManager } from "./disciplines/disciplineManager.js";
import { FollowDiscipline } from "./disciplines/follow.js";
import { WalkDiscipline } from "./disciplines/walk.js";
import { Unit } from "./unit.js";

export class Game extends Actor {
    private disciplineManager: DisciplineManager;
    private units: Unit[] = [];
    constructor() {
        super();
        this.disciplineManager = new DisciplineManager();
        const walkDiscipline = this.disciplineManager.addDiscipline(new WalkDiscipline());
        const leader = this.append(new Unit(0, walkDiscipline)) as Unit;
        
        const followDiscipline = this.disciplineManager.addDiscipline(new FollowDiscipline(leader)) as FollowDiscipline;
        for (let i = 1; i < 10; i++) {
            const unit = this.append(new Unit(40 * i)) as Unit;
            this.disciplineManager.switchDiscipline(unit, "follow");
        }
    }

    render(canvas: Canvas): void {
        super.render(canvas);
        canvas.draw.rect(Vector2.zero(), canvas.size, RenderColor.black());
    }

    tick(): void {
        super.tick();
        this.disciplineManager.executeDisciplines();
    }
}