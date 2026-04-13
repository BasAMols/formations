import { AnimalType } from "../individuals/animal.js";
import { CivilianType } from "../individuals/civilian.js";
import { SoldierType } from "../individuals/soldier.js";
import { FixedArray, fixedArray } from "../utility.js";
import { CenturyType, Century, NC_CenturyType } from "./century.js";
import { Contubernium } from "./contubernium.js";
import { BattleCohort } from "../battle/battleCohort.js";


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

    private get centuriesArr(): Century[] {
        return this.centuries as unknown as Century[];
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

    // --- deployment ---

    deploy(): BattleCohort {
        return new BattleCohort(
            this.centuries.map(c => c.deploy()),
        );
    }

    // --- permanent reassignment ---

    addCentury(century: Century): void {
        this.centuriesArr.push(century);
    }

    removeCentury(century: Century): Century {
        const idx = this.centuriesArr.indexOf(century);
        if (idx === -1) throw new Error('Century not found in this cohort');
        this.centuriesArr.splice(idx, 1);
        return century;
    }

    dissolveCentury(century: Century): void {
        const idx = this.centuriesArr.indexOf(century);
        if (idx === -1) throw new Error('Century not found in this cohort');
        this.centuriesArr.splice(idx, 1);

        // Consolidate the dying century's weak contubernia first
        const weakContubernia = [...century.contubernia].filter(
            c => c.combatants.filter(s => s.status === 'alive').length < 2,
        );
        for (const weak of weakContubernia) {
            century.dissolveContubernium(weak);
        }

        // Transfer remaining whole contubernia into surviving centuries (weakest first)
        const targets = [...this.centuriesArr];
        targets.sort((a, b) => a.contubernia.length - b.contubernia.length);

        for (const cont of [...century.contubernia]) {
            century.removeContubernium(cont);
            if (targets.length > 0) {
                targets[0].addContubernium(cont);
                targets.sort((a, b) => a.contubernia.length - b.contubernia.length);
            }
        }
    }

    transferContubernium(cont: Contubernium, from: Century, to: Century): void {
        from.removeContubernium(cont);
        to.addContubernium(cont);
    }
}
1