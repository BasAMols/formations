// === INFANTRY ===

import { Animal, AnimalType } from "../individuals/animal.js";
import { CenturionType, Centurion } from "../individuals/centurion.js";
import { Civilian, CivilianType } from "../individuals/civilian.js";
import { SoldierType, Soldier } from "../individuals/soldier.js";
import { FixedArray, fixedArray } from "../utility.js";
import { ContubernumType, Contubernium, NC_ContubernumType } from "./contubernium.js";


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
    readonly centurion: Centurion;
    readonly optio: Soldier;
    readonly signifer: Soldier;
    readonly tesserarius: Soldier;
    readonly contubernia: FixedArray<Contubernium, ContuberniumCount>;
    readonly centurionServant: Civilian;
    readonly centurionHorse: Animal<'horse'>;
    readonly centurionPackMule: Animal<'mule'>;
    readonly servantsPackMule: Animal<'mule'>;

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
    }

    get combatants(): SoldierType[] {
        return [
            this.centurion, this.optio, this.signifer, this.tesserarius,
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
}
