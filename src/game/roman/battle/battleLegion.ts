import type { Soldier } from '../individuals/soldier.js';
import type { BattleReport } from './battleReport.js';
import { BattleCentury } from './battleCentury.js';
import { BattleCohort } from './battleCohort.js';

const DISSOLUTION_THRESHOLD = 0.25;

export class BattleLegion {
    cohorts: BattleCohort[];
    readonly originalCohortCount: number;
    readonly originalStrength: number;

    constructor(cohorts: BattleCohort[]) {
        this.cohorts = cohorts;
        this.originalCohortCount = cohorts.length;
        this.originalStrength = cohorts.reduce(
            (sum, c) => sum + c.originalStrength, 0,
        );
    }

    get aliveSoldiers(): Soldier[] {
        return this.cohorts.flatMap(c => c.aliveSoldiers);
    }

    report(): BattleReport {
        const alive = this.aliveSoldiers.length;
        return {
            readiness: this.originalStrength > 0 ? alive / this.originalStrength : 0,
            alive,
            originalStrength: this.originalStrength,
            subUnits: this.cohorts.length,
            originalSubUnits: this.originalCohortCount,
        };
    }

    reorganize(): void {
        for (const c of this.cohorts) {
            c.reorganize();
        }

        const toDissolve: BattleCohort[] = [];
        const toKeep: BattleCohort[] = [];

        for (const c of this.cohorts) {
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

            // Transfer whole centuries first
            for (const century of [...dying.centuries]) {
                for (const target of toKeep) {
                    if (target.centuries.length < target.originalCenturyCount) {
                        target.centuries.push(century);
                        dying.centuries = dying.centuries.filter(c => c !== century);
                        break;
                    }
                }
            }

            // Transfer remaining whole contubernia
            const leftoverCenturies = [...dying.centuries];
            for (const dyingCentury of leftoverCenturies) {
                for (const cont of [...dyingCentury.contubernia]) {
                    for (const target of toKeep) {
                        const targetCentury = target.centuries.find(
                            c => c.contubernia.length < c.originalContuberniaCount,
                        );
                        if (targetCentury) {
                            targetCentury.contubernia.push(cont);
                            dyingCentury.contubernia = dyingCentury.contubernia.filter(
                                c => c !== cont,
                            );
                            break;
                        }
                    }
                }

                // Distribute remaining loose soldiers
                const loose: Soldier[] = dyingCentury.contubernia.flatMap(
                    c => c.aliveSoldiers,
                );
                for (const soldier of loose) {
                    for (const target of toKeep) {
                        const targetCentury = target.centuries.find(tc =>
                            tc.contubernia.some(
                                c => c.aliveSoldiers.length < c.originalStrength,
                            ),
                        );
                        if (targetCentury) {
                            const targetCont = targetCentury.contubernia.find(
                                c => c.aliveSoldiers.length < c.originalStrength,
                            );
                            if (targetCont) {
                                targetCont.soldiers.push(soldier);
                                break;
                            }
                        }
                    }
                }
            }
        }

        this.cohorts = toKeep;
    }

    dismiss(): void {
        for (const c of this.cohorts) {
            c.dismiss();
        }
    }
}
