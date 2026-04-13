import type { Soldier } from '../individuals/soldier.js';
import type { BattleReport } from './battleReport.js';
import { BattleContubernium } from './battleContubernium.js';

const DISSOLUTION_THRESHOLD = 0.25;

export class BattleCentury {
    centurion: Soldier;
    optio: Soldier;
    signifer: Soldier;
    tesserarius: Soldier;
    contubernia: BattleContubernium[];
    readonly originalContuberniaCount: number;
    readonly originalStrength: number;

    constructor(
        centurion: Soldier,
        optio: Soldier,
        signifer: Soldier,
        tesserarius: Soldier,
        contubernia: BattleContubernium[],
    ) {
        this.centurion = centurion;
        this.optio = optio;
        this.signifer = signifer;
        this.tesserarius = tesserarius;
        this.contubernia = contubernia;
        this.originalContuberniaCount = contubernia.length;
        this.originalStrength =
            4 + contubernia.reduce((sum, c) => sum + c.originalStrength, 0);
    }

    private get officers(): Soldier[] {
        return [this.centurion, this.optio, this.signifer, this.tesserarius];
    }

    get aliveSoldiers(): Soldier[] {
        return [
            ...this.officers.filter(s => s.status === 'alive'),
            ...this.contubernia.flatMap(c => c.aliveSoldiers),
        ];
    }

    report(): BattleReport {
        const alive = this.aliveSoldiers.length;
        return {
            readiness: this.originalStrength > 0 ? alive / this.originalStrength : 0,
            alive,
            originalStrength: this.originalStrength,
            subUnits: this.contubernia.length,
            originalSubUnits: this.originalContuberniaCount,
        };
    }

    reorganize(): void {
        const toDissolve: BattleContubernium[] = [];
        const toKeep: BattleContubernium[] = [];

        for (const c of this.contubernia) {
            if (c.report().readiness < DISSOLUTION_THRESHOLD) {
                toDissolve.push(c);
            } else {
                toKeep.push(c);
            }
        }

        if (toKeep.length === 0) return;

        toDissolve.sort((a, b) => a.report().readiness - b.report().readiness);

        const pool: Soldier[] = [];
        for (const c of toDissolve) {
            pool.push(...c.aliveSoldiers);
        }

        toKeep.sort((a, b) => a.report().readiness - b.report().readiness);

        for (const soldier of pool) {
            for (const target of toKeep) {
                if (target.aliveSoldiers.length < target.originalStrength) {
                    target.soldiers.push(soldier);
                    break;
                }
            }
        }

        this.contubernia = toKeep;
    }

    dismiss(): void {
        for (const c of this.contubernia) {
            c.dismiss();
        }
    }
}
