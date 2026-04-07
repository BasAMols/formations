import type { Discipline } from "./discipline.js";
import type { Unit } from "../unit.js";

export class DisciplineManager {
    private disciplines: Record<string, Discipline> = {};
    constructor() {
    }

    addDiscipline(discipline: Discipline): Discipline {
        this.disciplines[discipline.name] = discipline;
        return discipline;
    }

    executeDisciplines() {
        Object.values(this.disciplines).sort((a, b) => (b.priority - a.priority)).forEach(discipline => {
            discipline.run();
        });
    }

    switchDiscipline(unit: Unit, name: string) {
        if (unit.activeDiscipline === name) return;
        if (unit.activeDiscipline) {
            this.disciplines[unit.activeDiscipline].removeTarget(unit);
        }
        unit.activeDiscipline = name;
        this.disciplines[name].addTarget(unit);
    }
}