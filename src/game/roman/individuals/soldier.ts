import { Person, type PersonType } from './person.js';

export interface SoldierType extends PersonType {
    combatant: true;
}
export class Soldier extends Person implements SoldierType {
    declare readonly combatant: true;
    constructor() {
        super(true);
    }
}
