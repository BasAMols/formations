import type { Soldier } from '../individuals/soldier.js';
import type { BattleReport } from './battleReport.js';
import { BattleContubernium } from './battleContubernium.js';
import { BattleCentury } from './battleCentury.js';

const DISSOLUTION_THRESHOLD = 0.25;

export class BattleCohort {
    centuries: BattleCentury[];
    readonly originalCenturyCount: number;
    readonly originalStrength: number;

    constructor(centuries: BattleCentury[]) {
        this.centuries = centuries;
        this.originalCenturyCount = centuries.length;
        this.originalStrength = centuries.reduce(
            (sum, c) => sum + c.originalStrength, 0,
        );
    }

    get aliveSoldiers(): Soldier[] {
        return this.centuries.flatMap(c => c.aliveSoldiers);
    }

    report(): BattleReport {
        const alive = this.aliveSoldiers.length;
        return {
            readiness: this.originalStrength > 0 ? alive / this.originalStrength : 0,
            alive,
            originalStrength: this.originalStrength,
            subUnits: this.centuries.length,
            originalSubUnits: this.originalCenturyCount,
        };
    }

    reorganize(): void {
        for (const c of this.centuries) {
            c.reorganize();
        }

        const toDissolve: BattleCentury[] = [];
        const toKeep: BattleCentury[] = [];

        for (const c of this.centuries) {
            if (c.report().readiness < DISSOLUTION_THRESHOLD) {
                toDissolve.push(c);
            } else {
                toKeep.push(c);
            }
        }

        if (toKeep.length === 0) return;

        toDissolve.sort((a, b) => a.report().readiness - b.report().readiness);
        toKeep.sort((a, b) => a.report().readiness - b.report().readiness);

        for (const dying of toDissolve) {
            dying.reorganize();

            // Transfer whole contubernia first
            for (const cont of [...dying.contubernia]) {
                for (const target of toKeep) {
                    if (target.contubernia.length < target.originalContuberniaCount) {
                        target.contubernia.push(cont);
                        dying.contubernia = dying.contubernia.filter(c => c !== cont);
                        break;
                    }
                }
            }

            // Distribute remaining loose soldiers
            const leftover: Soldier[] = dying.contubernia.flatMap(c => c.aliveSoldiers);
            for (const soldier of leftover) {
                for (const target of toKeep) {
                    const targetCont = target.contubernia.find(
                        c => c.aliveSoldiers.length < c.originalStrength,
                    );
                    if (targetCont) {
                        targetCont.soldiers.push(soldier);
                        break;
                    }
                }
            }
        }

        this.centuries = toKeep;
    }

    dismiss(): void {
        for (const c of this.centuries) {
            c.dismiss();
        }
    }
}
