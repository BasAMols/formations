export interface PersonType {
    combatant: boolean;
}

// === BASE CLASSES ===

export class Person implements PersonType {
    readonly combatant: boolean;
    constructor(combatant: boolean) {
        this.combatant = combatant;
    }
}
