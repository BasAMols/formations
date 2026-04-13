export type PersonStatus = 'alive' | 'dead' | 'mia';

export interface PersonType {
    combatant: boolean;
    status: PersonStatus;
}

// === BASE CLASSES ===

export class Person implements PersonType {
    readonly combatant: boolean;
    status: PersonStatus = 'alive';
    homeUnit: object | undefined;
    constructor(combatant: boolean) {
        this.combatant = combatant;
    }
}
