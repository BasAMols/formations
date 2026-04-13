import { Vec2 } from "planck";
import type { Facing } from "./plotTypes.js";
import type { ContuberniumPlot } from "./contuberniumPlot.js";
import {
    createContuberniumPlot, createSigniferPlot, createOptioPlot,
    CONTUBERNIUM_WIDTH, CONTUBERNIUM_DEPTH,
} from "./contuberniumPlot.js";
import type { CenturionPlot } from "./centurionPlot.js";
import { createCenturionPlot, CENTURION_WIDTH } from "./centurionPlot.js";

export const PLOT_SPACING = 0.5;

export interface CenturyPlot {
    worldPosition: Vec2;
    facing: Facing;
    rowLength: number;
    rowDepth: number;

    centurionPlot: CenturionPlot;
    signiferPlot: ContuberniumPlot;
    contuberniumPlots: ContuberniumPlot[];
    optioPlot: ContuberniumPlot;
}

export function centuryRowLength(contuberniumCount: number): number {
    const plotCount = 3 + contuberniumCount;
    return CENTURION_WIDTH + CONTUBERNIUM_WIDTH * (2 + contuberniumCount)
        + PLOT_SPACING * (plotCount - 1);
}

export function createCenturyPlot(worldPosition: Vec2, contuberniumCount: number, facing: Facing): CenturyPlot {
    const isHorizontal = facing === 'south' || facing === 'north';
    const plotCount = 3 + contuberniumCount;
    const rowLength = CENTURION_WIDTH + CONTUBERNIUM_WIDTH * (2 + contuberniumCount)
        + PLOT_SPACING * (plotCount - 1);
    const rowDepth = CONTUBERNIUM_DEPTH;

    function offset(mainAxis: number): Vec2 {
        if (isHorizontal) {
            return new Vec2(worldPosition.x + mainAxis, worldPosition.y);
        }
        return new Vec2(worldPosition.x, worldPosition.y + mainAxis);
    }

    let cursor = 0;

    const centurionPlot = createCenturionPlot(offset(cursor), facing);
    cursor += CENTURION_WIDTH + PLOT_SPACING;

    const signiferPlot = createSigniferPlot(offset(cursor), facing);
    cursor += CONTUBERNIUM_WIDTH + PLOT_SPACING;

    const contuberniumPlots: ContuberniumPlot[] = [];
    for (let i = 0; i < contuberniumCount; i++) {
        contuberniumPlots.push(createContuberniumPlot(offset(cursor), facing));
        cursor += CONTUBERNIUM_WIDTH + PLOT_SPACING;
    }

    const optioPlot = createOptioPlot(offset(cursor), facing);

    return {

        worldPosition,
        facing,
        rowLength,
        rowDepth,
        centurionPlot,
        signiferPlot,
        contuberniumPlots,
        optioPlot,
    };
}
