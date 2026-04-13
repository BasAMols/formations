import { AnimalType } from "../individuals/animal.js";
import { CivilianType } from "../individuals/civilian.js";
import { SoldierType } from "../individuals/soldier.js";
import { FixedArray, fixedArray } from "../utility.js";
import { TurmaType, Turma, NC_TurmaType } from "./turma.js";


export type EquitesLegionisType = {
    turmae: FixedArray<TurmaType, 4>;
};

export type NC_EquitesLegionisType = EquitesLegionisType & {
    turmae: FixedArray<NC_TurmaType, 4>;
};


export class EquitesLegionis implements NC_EquitesLegionisType {
    readonly turmae: FixedArray<Turma, 4>;

    constructor() {
        this.turmae = fixedArray(4, () => new Turma());
    }

    get combatants(): SoldierType[] {
        return this.turmae.flatMap(t => t.combatants);
    }

    get civilians(): CivilianType[] {
        return this.turmae.flatMap(t => t.civilians);
    }

    get animals(): AnimalType[] {
        return this.turmae.flatMap(t => t.animals);
    }
}
