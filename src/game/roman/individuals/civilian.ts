import { Person, type PersonType } from './person.js';


export interface CivilianType extends PersonType {
    combatant: false;
}
export class Civilian extends Person implements CivilianType {
    declare readonly combatant: false;
    constructor() {
        super(false);
    }
}
