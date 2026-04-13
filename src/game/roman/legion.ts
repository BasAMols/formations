
// === LEGION ===

import { EquitesLegionisType, EquitesLegionis, NC_EquitesLegionisType } from "./cavalry/equitesLegionis.js";
import { Animal, AnimalType } from "./individuals/animal.js";
import { Civilian, CivilianType } from "./individuals/civilian.js";
import { PersonType, Person } from "./individuals/person.js";
import { SoldierType, Soldier } from "./individuals/soldier.js";
import { CohortType, Cohort, NC_CohortType } from "./infantry/cohort.js";
import { FixedArray, fixedArray } from "./utility.js";

export type LegionType = {
    legate: PersonType;
    broadStripeTribune: SoldierType;
    campPrefect: SoldierType;

    equitesLegionis: EquitesLegionisType;

    firstCohort: CohortType<5, 20>;
    cohorts: FixedArray<CohortType<6, 10>, 9>;
};


export type NC_LegionType = LegionType & {
    // --- command staff ---
    thinStripeTribunes: FixedArray<CivilianType, 5>; // administrative assistants to the legate

    // --- headquarters staff (officium) ---
    cornicularius: CivilianType; // chief clerk, head of admin staff
    beneficiarii: CivilianType[]; // aides for detached duty and special assignments
    librarii: CivilianType[]; // record keepers and scribes
    frumentarii: CivilianType[]; // supply and grain logistics
    speculatores: SoldierType[]; // scouts and intelligence (combatants, HQ-attached)

    // --- medical staff ---
    medici: CivilianType[]; // physicians and surgeons
    capsarii: CivilianType[]; // medical orderlies

    // --- musicians / signalers (legion-level assets) ---
    aquilifer: SoldierType; // carries the legion's eagle standard
    imaginifer: SoldierType; // carries the emperor's image
    cornicines: SoldierType[]; // horn blowers (~30)
    tubicines: SoldierType[]; // trumpeters (~30)
    bucinatores: SoldierType[]; // signal horn players (~10)

    // --- camp followers ---
    lixae: CivilianType[]; // merchants and traders

    // --- baggage train ---
    baggageMules: AnimalType<'mule'>[]; // legion-level baggage transport
    officerHorses: AnimalType<'horse'>[]; // mounts for legate, tribunes, prefect
    oxen: AnimalType<'ox'>[]; // heavy wagon draft animals for siege/artillery

    // --- structure ---
    equitesLegionis: NC_EquitesLegionisType;
    firstCohort: NC_CohortType<5, 20>;
    cohorts: FixedArray<NC_CohortType, 9>;
};



export class Legion implements NC_LegionType {
    // --- command ---
    readonly legate: Person;
    readonly broadStripeTribune: Soldier;
    readonly campPrefect: Soldier;
    readonly thinStripeTribunes: FixedArray<Civilian, 5>;

    // --- headquarters staff (officium) ---
    readonly cornicularius: Civilian;
    readonly beneficiarii: Civilian[];
    readonly librarii: Civilian[];
    readonly frumentarii: Civilian[];
    readonly speculatores: Soldier[];

    // --- medical staff ---
    readonly medici: Civilian[];
    readonly capsarii: Civilian[];

    // --- musicians / signalers ---
    readonly aquilifer: Soldier;
    readonly imaginifer: Soldier;
    readonly cornicines: Soldier[];
    readonly tubicines: Soldier[];
    readonly bucinatores: Soldier[];

    // --- camp followers ---
    readonly lixae: Civilian[];

    // --- baggage train ---
    readonly baggageMules: Animal<'mule'>[];
    readonly officerHorses: Animal<'horse'>[];
    readonly oxen: Animal<'ox'>[];

    // --- structure ---
    readonly equitesLegionis: EquitesLegionis;
    readonly firstCohort: Cohort<5, 20>;
    readonly cohorts: FixedArray<Cohort<6, 10>, 9>;

    constructor() {
        this.legate = new Person(true);
        this.broadStripeTribune = new Soldier();
        this.campPrefect = new Soldier();
        this.thinStripeTribunes = fixedArray(5, () => new Civilian());

        this.cornicularius = new Civilian();
        this.beneficiarii = fixedArray(10, () => new Civilian());
        this.librarii = fixedArray(6, () => new Civilian());
        this.frumentarii = fixedArray(10, () => new Civilian());
        this.speculatores = fixedArray(10, () => new Soldier());

        this.medici = fixedArray(4, () => new Civilian());
        this.capsarii = fixedArray(8, () => new Civilian());

        this.aquilifer = new Soldier();
        this.imaginifer = new Soldier();
        this.cornicines = fixedArray(30, () => new Soldier());
        this.tubicines = fixedArray(30, () => new Soldier());
        this.bucinatores = fixedArray(10, () => new Soldier());

        this.lixae = fixedArray(20, () => new Civilian());

        this.baggageMules = fixedArray(20, () => new Animal('mule'));
        this.officerHorses = fixedArray(8, () => new Animal('horse'));
        this.oxen = fixedArray(30, () => new Animal('ox'));

        this.equitesLegionis = new EquitesLegionis();
        this.firstCohort = new Cohort(5, 20);
        this.cohorts = fixedArray(9, () => new Cohort(6, 10));
    }

    get combatants(): SoldierType[] {
        return [
            this.legate as SoldierType,
            this.broadStripeTribune,
            this.campPrefect,
            this.aquilifer,
            this.imaginifer,
            ...this.speculatores,
            ...this.cornicines,
            ...this.tubicines,
            ...this.bucinatores,
            ...this.equitesLegionis.combatants,
            ...this.firstCohort.combatants,
            ...this.cohorts.flatMap(c => c.combatants),
        ];
    }

    get civilians(): CivilianType[] {
        return [
            ...this.thinStripeTribunes,
            this.cornicularius,
            ...this.beneficiarii,
            ...this.librarii,
            ...this.frumentarii,
            ...this.medici,
            ...this.capsarii,
            ...this.lixae,
            ...this.equitesLegionis.civilians,
            ...this.firstCohort.civilians,
            ...this.cohorts.flatMap(c => c.civilians),
        ];
    }

    get animals(): AnimalType[] {
        return [
            ...this.baggageMules,
            ...this.officerHorses,
            ...this.oxen,
            ...this.equitesLegionis.animals,
            ...this.firstCohort.animals,
            ...this.cohorts.flatMap(c => c.animals),
        ];
    }
}
