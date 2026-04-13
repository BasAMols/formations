
// === INFANTRY ===

import { Animal, type AnimalType } from "../individuals/animal.js";
import { Civilian, type CivilianType } from "../individuals/civilian.js";
import { type SoldierType, Soldier } from "../individuals/soldier.js";
import { FixedArray, fixedArray } from "../utility.js";

export type ContubernumType = {
    decanus: SoldierType;
    soldiers: FixedArray<SoldierType, 7>;
};

export type NC_ContubernumType = ContubernumType & {
    calones: FixedArray<CivilianType, 2>; // slave servants
    packMule: AnimalType<'mule'>;
};

export class Contubernium implements ContubernumType {
    readonly decanus: Soldier;
    readonly soldiers: FixedArray<Soldier, 7>;
    readonly calones: FixedArray<Civilian, 2>;
    readonly packMule: Animal<'mule'>;

    constructor() {
        this.decanus = new Soldier();
        this.soldiers = fixedArray(7, () => new Soldier());
        this.calones = fixedArray(2, () => new Civilian());
        this.packMule = new Animal('mule');
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
}
