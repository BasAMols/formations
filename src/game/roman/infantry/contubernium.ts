
// === INFANTRY ===

import { Animal, type AnimalType } from "../individuals/animal.js";
import { Civilian, type CivilianType } from "../individuals/civilian.js";
import { type SoldierType, Soldier } from "../individuals/soldier.js";
import { FixedArray, fixedArray } from "../utility.js";
import { BattleContubernium } from "../battle/battleContubernium.js";

export type ContubernumType = {
    decanus: SoldierType;
    soldiers: FixedArray<SoldierType, 7>;
};

export type NC_ContubernumType = ContubernumType & {
    calones: FixedArray<CivilianType, 2>; // slave servants
    packMule: AnimalType<'mule'>;
};

export class Contubernium implements ContubernumType {
    decanus: Soldier;
    readonly soldiers: FixedArray<Soldier, 7>;
    readonly calones: FixedArray<Civilian, 2>;
    packMule: Animal<'mule'>;

    constructor() {
        this.decanus = new Soldier();
        this.soldiers = fixedArray(7, () => new Soldier());
        this.calones = fixedArray(2, () => new Civilian());
        this.packMule = new Animal('mule');

        this.decanus.homeUnit = this;
        this.soldiers.forEach(s => s.homeUnit = this);
        this.calones.forEach(c => c.homeUnit = this);
        this.packMule.homeUnit = this;
    }

    get combatants(): SoldierType[] {
        return [this.decanus, ...this.soldiers];
    }

    get civilians(): CivilianType[] {
        return [...this.calones];
    }

    get animals(): AnimalType[] {
        return [this.packMule];
    }

    // --- deployment ---

    deploy(): BattleContubernium {
        const alive = this.combatants.filter(s => s.status === 'alive') as Soldier[];
        return new BattleContubernium(alive);
    }

    // --- permanent reassignment ---

    replaceSoldier(target: Soldier, replacement: Soldier): Soldier {
        if (this.decanus === target) {
            this.decanus = replacement;
        } else {
            const idx = this.soldiers.indexOf(target);
            if (idx === -1) throw new Error('Soldier not found in this contubernium');
            this.soldiers[idx] = replacement;
        }
        target.homeUnit = undefined;
        replacement.homeUnit = this;
        return target;
    }

    removeSoldier(target: Soldier): Soldier {
        if (this.decanus === target) {
            // promote first available soldier to decanus
            if (this.soldiers.length > 0) {
                this.decanus = this.soldiers.splice(0, 1)[0];
            }
        } else {
            const idx = this.soldiers.indexOf(target);
            if (idx === -1) throw new Error('Soldier not found in this contubernium');
            this.soldiers.splice(idx, 1);
        }
        target.homeUnit = undefined;
        return target;
    }

    addSoldier(soldier: Soldier): void {
        this.soldiers.push(soldier);
        soldier.homeUnit = this;
    }

    replaceCivilian(target: Civilian, replacement: Civilian): Civilian {
        const idx = this.calones.indexOf(target);
        if (idx === -1) throw new Error('Civilian not found in this contubernium');
        this.calones[idx] = replacement;
        target.homeUnit = undefined;
        replacement.homeUnit = this;
        return target;
    }

    replaceAnimal(target: Animal, replacement: Animal<'mule'>): Animal {
        if (this.packMule !== target) throw new Error('Animal not found in this contubernium');
        this.packMule = replacement;
        target.homeUnit = undefined;
        replacement.homeUnit = this;
        return target;
    }
}
