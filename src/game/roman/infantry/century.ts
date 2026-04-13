// === INFANTRY ===

import { Animal, AnimalType } from "../individuals/animal.js";
import { CenturionType, Centurion } from "../individuals/centurion.js";
import { Civilian, CivilianType } from "../individuals/civilian.js";
import { SoldierType, Soldier } from "../individuals/soldier.js";
import { FixedArray, fixedArray } from "../utility.js";
import { ContubernumType, Contubernium, NC_ContubernumType } from "./contubernium.js";
import { BattleCentury } from "../battle/battleCentury.js";


export type CenturyType<Count extends number = 10> = {
    centurion: CenturionType;
    optio: SoldierType;
    signifer: SoldierType;
    tesserarius: SoldierType;
    contubernia: FixedArray<ContubernumType, Count>;
};

export type NC_CenturyType<ContuberniumCount extends number = 10> = CenturyType<ContuberniumCount> & {
    contubernia: FixedArray<NC_ContubernumType, ContuberniumCount>;
    centurionServant: CivilianType; // personal servant for centurion
    centurionHorse: AnimalType<'horse'>; // centurions rode on the march
    centurionPackMule: AnimalType<'mule'>; // centurion's tent and personal gear
    servantsPackMule: AnimalType<'mule'>; // tent for the century's calones
};

export class Century<ContuberniumCount extends number = 10> implements NC_CenturyType<ContuberniumCount> {
    centurion: Centurion;
    optio: Soldier;
    signifer: Soldier;
    tesserarius: Soldier;
    readonly contubernia: FixedArray<Contubernium, ContuberniumCount>;
    centurionServant: Civilian;
    centurionHorse: Animal<'horse'>;
    centurionPackMule: Animal<'mule'>;
    servantsPackMule: Animal<'mule'>;

    constructor(contuberniumCount: ContuberniumCount) {
        this.centurion = new Centurion();
        this.optio = new Soldier();
        this.signifer = new Soldier();
        this.tesserarius = new Soldier();
        this.contubernia = fixedArray(contuberniumCount, () => new Contubernium());
        this.centurionServant = new Civilian();
        this.centurionHorse = new Animal('horse');
        this.centurionPackMule = new Animal('mule');
        this.servantsPackMule = new Animal('mule');

        this.centurion.homeUnit = this;
        this.optio.homeUnit = this;
        this.signifer.homeUnit = this;
        this.tesserarius.homeUnit = this;
        this.centurionServant.homeUnit = this;
        this.centurionHorse.homeUnit = this;
        this.centurionPackMule.homeUnit = this;
        this.servantsPackMule.homeUnit = this;
    }

    private get officers(): Soldier[] {
        return [this.centurion, this.optio, this.signifer, this.tesserarius];
    }

    get combatants(): SoldierType[] {
        return [
            ...this.officers,
            ...this.contubernia.flatMap(c => c.combatants),
        ];
    }

    get civilians(): CivilianType[] {
        return [
            this.centurionServant,
            ...this.contubernia.flatMap(c => c.civilians),
        ];
    }

    get animals(): AnimalType[] {
        return [
            this.centurionHorse, this.centurionPackMule, this.servantsPackMule,
            ...this.contubernia.flatMap(c => c.animals),
        ];
    }

    // --- deployment ---

    deploy(): BattleCentury {
        return new BattleCentury(
            this.centurion,
            this.optio,
            this.signifer,
            this.tesserarius,
            this.contubernia.map(c => c.deploy()),
        );
    }

    // --- permanent reassignment ---

    replaceSoldier(target: Soldier, replacement: Soldier): Soldier {
        if (this.centurion === target) {
            this.centurion = replacement as Centurion;
        } else if (this.optio === target) {
            this.optio = replacement;
        } else if (this.signifer === target) {
            this.signifer = replacement;
        } else if (this.tesserarius === target) {
            this.tesserarius = replacement;
        } else {
            const cont = this.contubernia.find(
                c => c.combatants.includes(target),
            );
            if (!cont) throw new Error('Soldier not found in this century');
            return cont.replaceSoldier(target, replacement);
        }
        target.homeUnit = undefined;
        replacement.homeUnit = this;
        return target;
    }

    addContubernium(cont: Contubernium): void {
        this.contubernia.push(cont);
    }

    removeContubernium(cont: Contubernium): Contubernium {
        const idx = this.contubernia.indexOf(cont);
        if (idx === -1) throw new Error('Contubernium not found in this century');
        this.contubernia.splice(idx, 1);
        return cont;
    }

    dissolveContubernium(cont: Contubernium): void {
        const idx = this.contubernia.indexOf(cont);
        if (idx === -1) throw new Error('Contubernium not found in this century');
        this.contubernia.splice(idx, 1);

        const alive = cont.combatants
            .filter(s => s.status === 'alive') as Soldier[];
        for (const soldier of alive) {
            cont.removeSoldier(soldier);
        }

        const remaining = [...this.contubernia];
        remaining.sort((a, b) => a.combatants.length - b.combatants.length);

        for (const soldier of alive) {
            const target = remaining.find(
                c => c.combatants.length < 8,
            );
            if (target) {
                target.addSoldier(soldier);
            }
        }
    }
}
