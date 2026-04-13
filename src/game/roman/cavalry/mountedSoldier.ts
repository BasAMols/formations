import { type AnimalType, Animal } from "../individuals/animal.js";
import type { SoldierType, Soldier } from "../individuals/soldier.js";


export type MountedSoldierType<T extends SoldierType = SoldierType> = {
    rider: T;
    mount: AnimalType<'horse'>;
};
export class MountedSoldier<T extends Soldier = Soldier> {
    readonly rider: T;
    readonly mount: Animal<'horse'>;
    constructor(rider: T) {
        this.rider = rider;
        this.mount = new Animal('horse');
    }
}
