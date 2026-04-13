import { Vec2 } from "planck";
import type { Rect } from "./plotTypes.js";
import { rect } from "./plotTypes.js";
import type { CohortPlot } from "./cohortPlot.js";
import { createCohortPlot, COHORT_BLOCK_WIDTH, COHORT_BLOCK_HEIGHT } from "./cohortPlot.js";
import type { FirstCohortPlot } from "./firstCohortPlot.js";
import { createFirstCohortPlot, FIRST_COHORT_BLOCK_HEIGHT, FIRST_COHORT_BLOCK_WIDTH } from "./firstCohortPlot.js";

export interface CampLayout {
    worldPosition: Vec2;
    outerSize: Vec2;

    wallSections: Rect[];
    gates: Rect[];
    cornerTowers: Vec2[];
    intervallumWidth: number;
    viaSagularisWidth: number;

    viaPraetoria: Rect;
    viaDecumana: Rect;
    viaPrincipalis: Rect;
    viaQuintana: Rect;

    praetenturaPlots: CohortPlot[];

    firstCohortPlot: FirstCohortPlot;
    praetorium: Rect;
    principia: Rect;
    tribuneTents: Rect;
    campPrefectQuarters: Rect;
    hqStaffArea: Rect;
    medicalArea: Rect;
    musiciansArea: Rect;
    cavalryBarracks: Rect;
    cavalryHorseLines: Rect;
    officerHorsePaddock: Rect;
    forum: Rect;

    retenturaPlots: CohortPlot[];
    granary: Rect;
    workshop: Rect;
    baggageTrainCorral: Rect;
    oxenCorral: Rect;
    lixaeArea: Rect;

    muleCorrals: Rect[];
    ovens: Rect[];
    grazingAreas: Rect[];
}

export const WALL_THICKNESS = 6;
export const INTERVALLUM = 15;
export const VIA_SAGULARIS = 6;
export const PERIMETER_INSET = WALL_THICKNESS + INTERVALLUM + VIA_SAGULARIS; // 27

export const VIA_PRAETORIA_WIDTH = 12;
export const VIA_DECUMANA_WIDTH = 8;
export const VIA_PRINCIPALIS_WIDTH = 12;
export const VIA_QUINTANA_WIDTH = 8;

export const GATE_WIDTH = 12;
export const GATE_DEPTH = WALL_THICKNESS;

export const COHORT_ROW_GAP = 4;

export const PRAETENTURA_DEPTH = 2 * COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP;
export const LATERA_DEPTH = FIRST_COHORT_BLOCK_HEIGHT + 10;
export const RETENTURA_DEPTH = 3 * COHORT_BLOCK_HEIGHT + 2 * COHORT_ROW_GAP;

export const OUTER = 2 * PERIMETER_INSET
    + PRAETENTURA_DEPTH
    + VIA_PRINCIPALIS_WIDTH
    + LATERA_DEPTH
    + VIA_QUINTANA_WIDTH
    + RETENTURA_DEPTH;

const INTERIOR = OUTER - 2 * PERIMETER_INSET;

export function createCampLayout(worldPosition: Vec2): CampLayout {
    const ox = worldPosition.x;
    const oy = worldPosition.y;

    const ix = ox + PERIMETER_INSET;
    const iy = oy + PERIMETER_INSET;

    const cx = ox + OUTER / 2;

    // --- Y positions for major horizontal bands ---
    const viaPrincipalisY = iy + PRAETENTURA_DEPTH;
    const lateraY = viaPrincipalisY + VIA_PRINCIPALIS_WIDTH;
    const viaQuintanaY = lateraY + LATERA_DEPTH;
    const retY = viaQuintanaY + VIA_QUINTANA_WIDTH;

    // --- Fortifications ---
    const gateNorthX = cx - GATE_WIDTH / 2;
    const gateSouthX = cx - GATE_WIDTH / 2;
    const eastWestGateY = viaPrincipalisY + VIA_PRINCIPALIS_WIDTH / 2 - GATE_WIDTH / 2;

    const wallSections: Rect[] = [
        rect(ox, oy, gateNorthX - ox, WALL_THICKNESS),
        rect(gateNorthX + GATE_WIDTH, oy, ox + OUTER - (gateNorthX + GATE_WIDTH), WALL_THICKNESS),
        rect(ox + OUTER - WALL_THICKNESS, oy, WALL_THICKNESS, eastWestGateY - oy),
        rect(ox + OUTER - WALL_THICKNESS, eastWestGateY + GATE_WIDTH, WALL_THICKNESS, oy + OUTER - (eastWestGateY + GATE_WIDTH)),
        rect(gateSouthX + GATE_WIDTH, oy + OUTER - WALL_THICKNESS, ox + OUTER - (gateSouthX + GATE_WIDTH), WALL_THICKNESS),
        rect(ox, oy + OUTER - WALL_THICKNESS, gateSouthX - ox, WALL_THICKNESS),
        rect(ox, eastWestGateY + GATE_WIDTH, WALL_THICKNESS, oy + OUTER - (eastWestGateY + GATE_WIDTH)),
        rect(ox, oy, WALL_THICKNESS, eastWestGateY - oy),
    ];

    const gates: Rect[] = [
        rect(gateNorthX, oy, GATE_WIDTH, GATE_DEPTH),
        rect(gateSouthX, oy + OUTER - GATE_DEPTH, GATE_WIDTH, GATE_DEPTH),
        rect(ox, eastWestGateY, GATE_DEPTH, GATE_WIDTH),
        rect(ox + OUTER - GATE_DEPTH, eastWestGateY, GATE_DEPTH, GATE_WIDTH),
    ];

    const cornerTowers: Vec2[] = [
        new Vec2(ox, oy),
        new Vec2(ox + OUTER, oy),
        new Vec2(ox, oy + OUTER),
        new Vec2(ox + OUTER, oy + OUTER),
    ];

    // --- Major Streets ---
    const viaPraetoria = rect(
        cx - VIA_PRAETORIA_WIDTH / 2, iy,
        VIA_PRAETORIA_WIDTH, viaPrincipalisY - iy,
    );

    const viaDecumana = rect(
        cx - VIA_DECUMANA_WIDTH / 2, retY,
        VIA_DECUMANA_WIDTH, oy + OUTER - PERIMETER_INSET - retY,
    );

    const viaPrincipalis = rect(ix, viaPrincipalisY, INTERIOR, VIA_PRINCIPALIS_WIDTH);
    const viaQuintana = rect(ix, viaQuintanaY, INTERIOR, VIA_QUINTANA_WIDTH);

    // --- Praetentura (cohorts 2-5, 2x2 grid flanking via praetoria) ---
    const praeLeftX = cx - VIA_PRAETORIA_WIDTH / 2 - COHORT_BLOCK_WIDTH;
    const praeRightX = cx + VIA_PRAETORIA_WIDTH / 2;

    const praetenturaPlots: CohortPlot[] = [
        createCohortPlot(new Vec2(praeLeftX, iy)),
        createCohortPlot(new Vec2(praeRightX, iy)),
        createCohortPlot(new Vec2(praeLeftX, iy + COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP)),
        createCohortPlot(new Vec2(praeRightX, iy + COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP)),
    ];

    // --- Latera Praetorii ---
    const firstCohortPlot = createFirstCohortPlot(new Vec2(cx + VIA_PRAETORIA_WIDTH / 2 + 5, lateraY + 5));

    const hqLeftX = cx - VIA_PRAETORIA_WIDTH / 2 - 5;
    const praetorium = rect(hqLeftX - 30, lateraY + 10, 30, 30);
    const principia = rect(hqLeftX - 30 + 32, lateraY + 10, 25, 25);

    const tribuneTents = rect(cx - 20, lateraY + 2, 40, 12);

    const campPrefectQuarters = rect(praetorium.position.x - 12, lateraY + 15, 10, 10);

    const hqStaffArea = rect(
        principia.position.x + principia.size.x + 2,
        lateraY + 10,
        30, 15,
    );

    const medicalArea = rect(ix + 5, lateraY + 25, 25, 15);

    const musiciansArea = rect(principia.position.x, lateraY + 38, 25, 12);

    const cavalryBarracks = rect(ix + INTERIOR - 65, lateraY + 25, 60, 30);
    const cavalryHorseLines = rect(cavalryBarracks.position.x + 5, lateraY + 57, 50, 8);

    const officerHorsePaddock = rect(praetorium.position.x - 17, lateraY + 30, 15, 10);

    const forum = rect(cx - 15, lateraY + LATERA_DEPTH - 20, 30, 15);

    // --- Retentura (cohorts 6-10 + supply, flanking via decumana) ---
    const retLeftX = cx - VIA_DECUMANA_WIDTH / 2 - COHORT_BLOCK_WIDTH;
    const retRightX = cx + VIA_DECUMANA_WIDTH / 2;

    const retenturaPlots: CohortPlot[] = [
        createCohortPlot(new Vec2(retLeftX, retY)),
        createCohortPlot(new Vec2(retRightX, retY)),
        createCohortPlot(new Vec2(retLeftX, retY + COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP)),
        createCohortPlot(new Vec2(retRightX, retY + COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP)),
        createCohortPlot(new Vec2(retLeftX, retY + 2 * (COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP))),
    ];

    const supplyX = retRightX;
    const supplyY = retY + 2 * (COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP);

    const granary = rect(supplyX + 2, supplyY + 2, 25, 15);
    const workshop = rect(supplyX + 29, supplyY + 2, 20, 10);
    const baggageTrainCorral = rect(supplyX + 2, supplyY + 19, 30, 20);
    const oxenCorral = rect(supplyX + 34, supplyY + 14, 25, 15);
    const lixaeArea = rect(supplyX + 34, supplyY + 31, 20, 10);

    // --- Perimeter areas ---
    const muleCorrals: Rect[] = [
        rect(cx - 20, oy + WALL_THICKNESS + 2, 40, 10),
        rect(cx - 20, oy + OUTER - WALL_THICKNESS - 12, 40, 10),
    ];

    const ovens: Rect[] = [
        rect(ox + OUTER - WALL_THICKNESS - 20, oy + WALL_THICKNESS + 5, 15, 5),
        rect(ox + WALL_THICKNESS + 5, oy + OUTER - WALL_THICKNESS - 10, 15, 5),
    ];

    const grazingAreas: Rect[] = [
        rect(ox + OUTER - WALL_THICKNESS - INTERVALLUM + 2, oy + OUTER / 3, 12, 60),
    ];

    return {
        worldPosition,
        outerSize: new Vec2(OUTER, OUTER),
        wallSections,
        gates,
        cornerTowers,
        intervallumWidth: INTERVALLUM,
        viaSagularisWidth: VIA_SAGULARIS,
        viaPraetoria,
        viaDecumana,
        viaPrincipalis,
        viaQuintana,
        praetenturaPlots,
        firstCohortPlot,
        praetorium,
        principia,
        tribuneTents,
        campPrefectQuarters,
        hqStaffArea,
        medicalArea,
        musiciansArea,
        cavalryBarracks,
        cavalryHorseLines,
        officerHorsePaddock,
        forum,
        retenturaPlots,
        granary,
        workshop,
        baggageTrainCorral,
        oxenCorral,
        lixaeArea,
        muleCorrals,
        ovens,
        grazingAreas,
    };
}
