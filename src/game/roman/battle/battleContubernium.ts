import type { Soldier } from '../individuals/soldier.js';
import type { BattleReport } from './battleReport.js';

export class BattleContubernium {
    soldiers: Soldier[];
    readonly originalStrength: number;

    constructor(soldiers: Soldier[]) {
        this.soldiers = soldiers;
        this.originalStrength = soldiers.length;
    }

    get aliveSoldiers(): Soldier[] {
        return this.soldiers.filter(s => s.status === 'alive');
    }

    report(): BattleReport {
        const alive = this.aliveSoldiers.length;
        return {
            readiness: this.originalStrength > 0 ? alive / this.originalStrength : 0,
            alive,
            originalStrength: this.originalStrength,
            subUnits: 1,
            originalSubUnits: 1,
        };
    }

    dismiss(): void {
        // nothing to cascade -- soldiers retain their homeUnit back-references
    }
}
