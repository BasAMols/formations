import type { Actor } from "../../../../engine/core/actor.js";
import { Discipline, type DisciplineInstance } from "../../../../engine/module/discipline/discipline.js";

export class NullDiscipline extends Discipline {
    readonly name = "null";
    readonly order = 10;

    create(_actor: Actor): DisciplineInstance {
        return {
            execute() {},
        };
    }
}
