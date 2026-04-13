
export type AnimalSpecies = 'horse' | 'mule' | 'ox' | 'donkey';

export interface AnimalType<T extends AnimalSpecies = AnimalSpecies> {
    species: T;
}

export class Animal<T extends AnimalSpecies = AnimalSpecies> implements AnimalType<T> {
    readonly species: T;
    homeUnit: object | undefined;
    constructor(species: T) {
        this.species = species;
    }
}
