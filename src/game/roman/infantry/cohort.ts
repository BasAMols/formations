import { AnimalType } from "../individuals/animal.js";
import { CivilianType } from "../individuals/civilian.js";
import { SoldierType } from "../individuals/soldier.js";
import { FixedArray, fixedArray } from "../utility.js";
import { CenturyType, Century, NC_CenturyType } from "./century.js";


export type CohortType<CenturyCount extends number = 6, ContuberniumCount extends number = 10> = {
    centuries: FixedArray<CenturyType<ContuberniumCount>, CenturyCount>;
};

export type NC_CohortType<CenturyCount extends number = 6, ContuberniumCount extends number = 10> = CohortType<CenturyCount, ContuberniumCount> & {
    centuries: FixedArray<NC_CenturyType<ContuberniumCount>, CenturyCount>;
};

export class Cohort<CenturyCount extends number = 6, ContuberniumCount extends number = 10> implements NC_CohortType<CenturyCount, ContuberniumCount> {
    readonly centuries: FixedArray<Century<ContuberniumCount>, CenturyCount>;

    constructor(centuryCount: CenturyCount, contuberniumCount: ContuberniumCount) {
        this.centuries = fixedArray(centuryCount, () => new Century(contuberniumCount));
    }

    get combatants(): SoldierType[] {
        return this.centuries.flatMap(c => c.combatants);
    }

    get civilians(): CivilianType[] {
        return this.centuries.flatMap(c => c.civilians);
    }

    get animals(): AnimalType[] {
        return this.centuries.flatMap(c => c.animals);
    }
}
