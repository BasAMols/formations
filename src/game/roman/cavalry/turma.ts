import { Civilian, type CivilianType } from '../individuals/civilian.js';
import { Soldier, type SoldierType } from '../individuals/soldier.js';
import { Decurion, type DecurionType } from '../individuals/decurion.js';
import { Animal, type AnimalType } from '../individuals/animal.js';
import { MountedSoldier, type MountedSoldierType } from './mountedSoldier.js';
import { CavalryFile, type CavalryFileType } from './cavalryFile.js';
import { fixedArray, FixedArray } from '../utility.js';

export type TurmaType = {
    decurion: MountedSoldierType<DecurionType>;
    duplicarius: MountedSoldierType;
    sesquiplicarius: MountedSoldierType;
    files: FixedArray<CavalryFileType, 3>;
};

export type NC_TurmaType = TurmaType & {
    packMules: AnimalType<'mule'>[]; // tents and gear (~7 per turma)
    grooms: CivilianType[]; // horse care servants
};

export class Turma implements NC_TurmaType {
    readonly decurion: MountedSoldier<Decurion>;
    readonly duplicarius: MountedSoldier;
    readonly sesquiplicarius: MountedSoldier;
    readonly files: FixedArray<CavalryFile, 3>;
    readonly packMules: Animal<'mule'>[];
    readonly grooms: Civilian[];

    constructor() {
        this.decurion = new MountedSoldier(new Decurion());
        this.duplicarius = new MountedSoldier(new Soldier());
        this.sesquiplicarius = new MountedSoldier(new Soldier());
        this.files = fixedArray(3, () => new CavalryFile());
        this.packMules = fixedArray(7, () => new Animal('mule'));
        this.grooms = fixedArray(3, () => new Civilian());
    }

    get combatants(): SoldierType[] {
        return [
            this.decurion.rider, this.duplicarius.rider, this.sesquiplicarius.rider,
            ...this.files.flatMap(f => f.combatants),
        ];
    }

    get civilians(): CivilianType[] {
        return [...this.grooms];
    }

    get animals(): AnimalType[] {
        return [
            this.decurion.mount, this.duplicarius.mount, this.sesquiplicarius.mount,
            ...this.files.flatMap(f => f.animals),
            ...this.packMules,
        ];
    }
}
