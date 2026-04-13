import { Vec2 } from "planck";
import type { FormationGrid, Rect } from "./plotTypes.js";
import { jitter, rect } from "./plotTypes.js";
import type { CenturyPlot } from "./centuryPlot.js";
import { createCenturyPlot, centuryRowLength } from "./centuryPlot.js";
import { CONTUBERNIUM_DEPTH } from "./contuberniumPlot.js";

const CENTURY_Y_OFFSETS = [0, 11.0, 23.0, 34.0, 46.0];
const STRIGA_FACINGS: ('south' | 'north')[] = ['south', 'north', 'south', 'north', 'south'];

const CONTUBERNIA_PER_CENTURY = 20;
const RESIDENTIAL_WIDTH = centuryRowLength(CONTUBERNIA_PER_CENTURY);
const BLOCK_HEIGHT = 55.0;
const DRILL_GAP = 2;

export const FIRST_COHORT_BLOCK_HEIGHT = BLOCK_HEIGHT;
export const FIRST_COHORT_BLOCK_WIDTH = RESIDENTIAL_WIDTH + DRILL_GAP + 14 * 1.5;

export interface FirstCohortPlot {
    worldPosition: Vec2;
    blockSize: Vec2;

    centuryPlots: CenturyPlot[];

    drillGround: FormationGrid;

    standardShrine: Vec2;
    standardGuardSlots: Vec2[];

    waterPoint: Vec2;
    waterSlots: Vec2[];

    workshopArea: Rect;
    workbenchSlots: Vec2[];

    latrineArea: Rect;

    watchPosts: Vec2[];
}

export function createFirstCohortPlot(worldPosition: Vec2): FirstCohortPlot {
    const wx = worldPosition.x;
    const wy = worldPosition.y;

    const centuryPlots: CenturyPlot[] = [];
    for (let i = 0; i < 5; i++) {
        centuryPlots.push(createCenturyPlot(
            new Vec2(wx, wy + CENTURY_Y_OFFSETS[i]),
            CONTUBERNIA_PER_CENTURY,
            STRIGA_FACINGS[i],
        ));
    }

    const drillOriginX = wx + RESIDENTIAL_WIDTH + DRILL_GAP;
    const drillOriginY = wy + 2;
    const drillGround: FormationGrid = {
        origin: new Vec2(drillOriginX, drillOriginY),
        files: 14,
        ranks: 12,
        fileSpacing: 1.5,
        rankSpacing: 1,
    };

    const centerX = wx + RESIDENTIAL_WIDTH / 2;
    const gap1CenterY = wy + (CENTURY_Y_OFFSETS[1] + CONTUBERNIUM_DEPTH + CENTURY_Y_OFFSETS[2]) / 2;

    const standardShrine = jitter(new Vec2(centerX, gap1CenterY), 0.15);
    const standardGuardSlots = [
        jitter(new Vec2(centerX - 1.5, gap1CenterY), 0.1),
        jitter(new Vec2(centerX + 1.5, gap1CenterY), 0.1),
    ];

    const waterPoint = new Vec2(wx + RESIDENTIAL_WIDTH - 2, wy + 2);
    const waterSlots = [
        new Vec2(waterPoint.x, waterPoint.y),
        new Vec2(waterPoint.x + 1.5, waterPoint.y),
    ];

    const workshopArea = rect(wx + 2, wy + 20.25, 4, 2.5);
    const workbenchSlots = [
        jitter(new Vec2(wx + 3, gap1CenterY), 0.1),
        jitter(new Vec2(wx + 4, gap1CenterY), 0.1),
        jitter(new Vec2(wx + 5, gap1CenterY), 0.1),
    ];

    const latrineArea = rect(wx + RESIDENTIAL_WIDTH - 10, wy + BLOCK_HEIGHT - 2, 8, 2);

    const watchPosts = [
        new Vec2(wx, wy),
        new Vec2(wx + RESIDENTIAL_WIDTH, wy),
        new Vec2(wx, wy + BLOCK_HEIGHT),
        new Vec2(wx + RESIDENTIAL_WIDTH, wy + BLOCK_HEIGHT),
    ];

    const drillWidth = 14 * 1.5;
    const totalWidth = RESIDENTIAL_WIDTH + DRILL_GAP + drillWidth;

    return {
        worldPosition,
        blockSize: new Vec2(totalWidth, BLOCK_HEIGHT),
        centuryPlots,
        drillGround,
        standardShrine,
        standardGuardSlots,
        waterPoint,
        waterSlots,
        workshopArea,
        workbenchSlots,
        latrineArea,
        watchPosts,
    };
}
