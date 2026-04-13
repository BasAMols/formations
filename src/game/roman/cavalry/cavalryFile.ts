
// === CAVALRY ===

import { AnimalType } from "../individuals/animal.js";
import { Soldier, SoldierType } from "../individuals/soldier.js";
import { FixedArray, fixedArray } from "../utility.js";
import { MountedSoldierType, MountedSoldier } from "./mountedSoldier.js";

export type CavalryFileType = {
    equites: FixedArray<MountedSoldierType, 9>;
};
export class CavalryFile implements CavalryFileType {
    readonly equites: FixedArray<MountedSoldier, 9>;

    constructor() {
        this.equites = fixedArray(9, () => new MountedSoldier(new Soldier()));
    }

    get combatants(): SoldierType[] {
        return this.equites.map(e => e.rider);
    }

    get animals(): AnimalType[] {
        return this.equites.map(e => e.mount);
    }
}
