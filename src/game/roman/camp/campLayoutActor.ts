import { Vec2 } from "planck";
import { Actor } from "../../../engine/core/actor.js";
import { RenderColor } from "../../../engine/util/color.js";
import { RectRenderer } from "../../../engine/render/rectRenderer.js";
import { OutlineRenderer } from "../../../engine/render/outlineRenderer.js";
import { SlotRenderer } from "../../../engine/render/slotRenderer.js";
import {
    OUTER, PERIMETER_INSET,
    WALL_THICKNESS, GATE_WIDTH,
    VIA_PRAETORIA_WIDTH, VIA_DECUMANA_WIDTH,
    VIA_PRINCIPALIS_WIDTH, VIA_QUINTANA_WIDTH,
    COHORT_ROW_GAP,
    PRAETENTURA_DEPTH, LATERA_DEPTH, RETENTURA_DEPTH,
} from "./campLayout.js";
import { COHORT_BLOCK_WIDTH, COHORT_BLOCK_HEIGHT } from "./cohortPlot.js";
import { FIRST_COHORT_BLOCK_WIDTH, FIRST_COHORT_BLOCK_HEIGHT } from "./firstCohortPlot.js";
import { METERS_TO_PIXELS } from "./contuberniumPlotActor.js";
import { CohortPlotActor } from "./cohortPlotActor.js";
import { campRenderSettings } from "./campRenderSettings.js";

const WALL_COLOR = new RenderColor(0.3, 0.25, 0.2, 0.9);
const GATE_COLOR = new RenderColor(0.75, 0.65, 0.4, 0.9);
const STREET_COLOR = new RenderColor(0.85, 0.8, 0.7, 0.25);
const CAMP_BOUNDS_COLOR = new RenderColor(0.4, 0.4, 0.4, 0.5);
const COLLAPSED_COLOR = new RenderColor(0.35, 0.4, 0.35, 0.4);
const AREA_COLOR = new RenderColor(0.6, 0.55, 0.5, 0.35);
const SUPPLY_COLOR = new RenderColor(0.5, 0.5, 0.6, 0.35);
const CAVALRY_COLOR = new RenderColor(0.6, 0.5, 0.4, 0.35);
const HQ_COLOR = new RenderColor(0.7, 0.55, 0.4, 0.4);

function rectActor(x: number, y: number, w: number, h: number, color: RenderColor): Actor {
    const a = new Actor({ position: new Vec2(x + w / 2, y + h / 2) });
    a.addController(new RectRenderer(w, h, color));
    return a;
}

function outlineActor(x: number, y: number, w: number, h: number, color: RenderColor, lineWidth = 1): Actor {
    const a = new Actor({ position: new Vec2(x + w / 2, y + h / 2) });
    a.addController(new OutlineRenderer(w, h, color, lineWidth, true));
    return a;
}

function slotActor(x: number, y: number, radius: number): Actor {
    const a = new Actor({ position: new Vec2(x, y) });
    a.addController(new SlotRenderer(radius));
    return a;
}

export class CampLayoutActor extends Actor {
    constructor(x: number, y: number) {
        super({ position: new Vec2(x, y) });

        const settings = campRenderSettings;
        const s = METERS_TO_PIXELS;

        const totalW = OUTER * s;
        const totalH = OUTER * s;

        if (settings.depth >= 4) {
            const fill = new Actor({ position: new Vec2(totalW / 2, totalH / 2) });
            fill.addController(new RectRenderer(totalW, totalH, COLLAPSED_COLOR));
            this.append(fill);
            return;
        }

        // --- Camp bounding outline ---
        if (settings.renderOutlines) {
            this.append(outlineActor(0, 0, totalW, totalH, CAMP_BOUNDS_COLOR, 2));
        }

        // --- Computed Y positions (meters) ---
        const iy = PERIMETER_INSET;
        const viaPrincipalisY = iy + PRAETENTURA_DEPTH;
        const lateraY = viaPrincipalisY + VIA_PRINCIPALIS_WIDTH;
        const viaQuintanaY = lateraY + LATERA_DEPTH;
        const retY = viaQuintanaY + VIA_QUINTANA_WIDTH;
        const cx = OUTER / 2;

        // --- Fortifications ---
        const gateNorthX = cx - GATE_WIDTH / 2;

        // E/W gates aligned with via principalis center
        const ewGateY = viaPrincipalisY + VIA_PRINCIPALIS_WIDTH / 2 - GATE_WIDTH / 2;

        // North wall sections
        this.append(rectActor(0, 0, gateNorthX * s, WALL_THICKNESS * s, WALL_COLOR));
        this.append(rectActor((gateNorthX + GATE_WIDTH) * s, 0, (OUTER - gateNorthX - GATE_WIDTH) * s, WALL_THICKNESS * s, WALL_COLOR));

        // South wall sections
        this.append(rectActor(0, (OUTER - WALL_THICKNESS) * s, gateNorthX * s, WALL_THICKNESS * s, WALL_COLOR));
        this.append(rectActor((gateNorthX + GATE_WIDTH) * s, (OUTER - WALL_THICKNESS) * s, (OUTER - gateNorthX - GATE_WIDTH) * s, WALL_THICKNESS * s, WALL_COLOR));

        // East wall sections
        this.append(rectActor((OUTER - WALL_THICKNESS) * s, 0, WALL_THICKNESS * s, ewGateY * s, WALL_COLOR));
        this.append(rectActor((OUTER - WALL_THICKNESS) * s, (ewGateY + GATE_WIDTH) * s, WALL_THICKNESS * s, (OUTER - ewGateY - GATE_WIDTH) * s, WALL_COLOR));

        // West wall sections
        this.append(rectActor(0, 0, WALL_THICKNESS * s, ewGateY * s, WALL_COLOR));
        this.append(rectActor(0, (ewGateY + GATE_WIDTH) * s, WALL_THICKNESS * s, (OUTER - ewGateY - GATE_WIDTH) * s, WALL_COLOR));

        // Gates
        this.append(rectActor(gateNorthX * s, 0, GATE_WIDTH * s, WALL_THICKNESS * s, GATE_COLOR));
        this.append(rectActor(gateNorthX * s, (OUTER - WALL_THICKNESS) * s, GATE_WIDTH * s, WALL_THICKNESS * s, GATE_COLOR));
        this.append(rectActor(0, ewGateY * s, WALL_THICKNESS * s, GATE_WIDTH * s, GATE_COLOR));
        this.append(rectActor((OUTER - WALL_THICKNESS) * s, ewGateY * s, WALL_THICKNESS * s, GATE_WIDTH * s, GATE_COLOR));

        // Corner towers
        if (settings.renderSlots) {
            const towerR = 3 * s;
            this.append(slotActor(0, 0, towerR));
            this.append(slotActor(OUTER * s, 0, towerR));
            this.append(slotActor(0, OUTER * s, towerR));
            this.append(slotActor(OUTER * s, OUTER * s, towerR));
        }

        // --- Streets ---
        // Via Praetoria (north gate to via principalis)
        this.append(rectActor(
            (cx - VIA_PRAETORIA_WIDTH / 2) * s, iy * s,
            VIA_PRAETORIA_WIDTH * s, PRAETENTURA_DEPTH * s,
            STREET_COLOR,
        ));

        // Via Decumana (via quintana to south perimeter)
        const retBottom = OUTER - PERIMETER_INSET;
        this.append(rectActor(
            (cx - VIA_DECUMANA_WIDTH / 2) * s, retY * s,
            VIA_DECUMANA_WIDTH * s, (retBottom - retY) * s,
            STREET_COLOR,
        ));

        // Via Principalis (full interior width)
        const interior = OUTER - 2 * PERIMETER_INSET;
        this.append(rectActor(
            iy * s, viaPrincipalisY * s,
            interior * s, VIA_PRINCIPALIS_WIDTH * s,
            STREET_COLOR,
        ));

        // Via Quintana (full interior width)
        this.append(rectActor(
            iy * s, viaQuintanaY * s,
            interior * s, VIA_QUINTANA_WIDTH * s,
            STREET_COLOR,
        ));

        // --- Praetentura: Cohorts 2-5 (2x2 grid flanking via praetoria) ---
        const praeLeftX = cx - VIA_PRAETORIA_WIDTH / 2 - COHORT_BLOCK_WIDTH;
        const praeRightX = cx + VIA_PRAETORIA_WIDTH / 2;

        this.append(new CohortPlotActor(praeLeftX * s, iy * s, 6, 10));
        this.append(new CohortPlotActor(praeRightX * s, iy * s, 6, 10));
        this.append(new CohortPlotActor(praeLeftX * s, (iy + COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP) * s, 6, 10));
        this.append(new CohortPlotActor(praeRightX * s, (iy + COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP) * s, 6, 10));

        // --- Latera Praetorii ---
        // First cohort (right side of via praetoria)
        const firstCohortX = cx + VIA_PRAETORIA_WIDTH / 2 + 5;
        const firstCohortY = lateraY + 5;
        this.append(new CohortPlotActor(firstCohortX * s, firstCohortY * s, 5, 20));

        // HQ buildings (left side)
        const hqLeftX = cx - VIA_PRAETORIA_WIDTH / 2 - 5;

        if (settings.renderOutlines) {
            // Praetorium
            this.append(outlineActor((hqLeftX - 30) * s, (lateraY + 10) * s, 30 * s, 30 * s, HQ_COLOR, 2));
            // Principia
            this.append(outlineActor((hqLeftX - 30 + 32) * s, (lateraY + 10) * s, 25 * s, 25 * s, HQ_COLOR, 2));
            // Tribune tents
            this.append(outlineActor((cx - 20) * s, (lateraY + 2) * s, 40 * s, 12 * s, AREA_COLOR));
            // Camp prefect quarters
            const praetX = hqLeftX - 30;
            this.append(outlineActor((praetX - 12) * s, (lateraY + 15) * s, 10 * s, 10 * s, AREA_COLOR));
            // HQ staff area
            const princRightX = hqLeftX - 30 + 32 + 25;
            this.append(outlineActor((princRightX + 2) * s, (lateraY + 10) * s, 30 * s, 15 * s, AREA_COLOR));
            // Medical area
            this.append(outlineActor((iy + 5) * s, (lateraY + 25) * s, 25 * s, 15 * s, AREA_COLOR));
            // Musicians area
            this.append(outlineActor((hqLeftX - 30 + 32) * s, (lateraY + 38) * s, 25 * s, 12 * s, AREA_COLOR));
            // Forum
            this.append(outlineActor((cx - 15) * s, (lateraY + LATERA_DEPTH - 20) * s, 30 * s, 15 * s, AREA_COLOR));
            // Officer horse paddock
            this.append(outlineActor((praetX - 17) * s, (lateraY + 30) * s, 15 * s, 10 * s, CAVALRY_COLOR));
            // Cavalry barracks
            this.append(outlineActor((iy + interior - 65) * s, (lateraY + 25) * s, 60 * s, 30 * s, CAVALRY_COLOR));
            // Cavalry horse lines
            this.append(outlineActor((iy + interior - 60) * s, (lateraY + 57) * s, 50 * s, 8 * s, CAVALRY_COLOR));
        }

        // --- Retentura: Cohorts 6-10 (3 rows, last row only left) ---
        const retLeftX = cx - VIA_DECUMANA_WIDTH / 2 - COHORT_BLOCK_WIDTH;
        const retRightX = cx + VIA_DECUMANA_WIDTH / 2;

        this.append(new CohortPlotActor(retLeftX * s, retY * s, 6, 10));
        this.append(new CohortPlotActor(retRightX * s, retY * s, 6, 10));
        this.append(new CohortPlotActor(retLeftX * s, (retY + COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP) * s, 6, 10));
        this.append(new CohortPlotActor(retRightX * s, (retY + COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP) * s, 6, 10));
        this.append(new CohortPlotActor(retLeftX * s, (retY + 2 * (COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP)) * s, 6, 10));

        // Supply block (row 3, right slot)
        if (settings.renderOutlines) {
            const supplyX = retRightX;
            const supplyY = retY + 2 * (COHORT_BLOCK_HEIGHT + COHORT_ROW_GAP);
            this.append(outlineActor(supplyX * s, supplyY * s, COHORT_BLOCK_WIDTH * s, COHORT_BLOCK_HEIGHT * s, SUPPLY_COLOR, 1));

            this.append(outlineActor((supplyX + 2) * s, (supplyY + 2) * s, 25 * s, 15 * s, SUPPLY_COLOR));
            this.append(outlineActor((supplyX + 29) * s, (supplyY + 2) * s, 20 * s, 10 * s, SUPPLY_COLOR));
            this.append(outlineActor((supplyX + 2) * s, (supplyY + 19) * s, 30 * s, 20 * s, SUPPLY_COLOR));
            this.append(outlineActor((supplyX + 34) * s, (supplyY + 14) * s, 25 * s, 15 * s, CAVALRY_COLOR));
            this.append(outlineActor((supplyX + 34) * s, (supplyY + 31) * s, 20 * s, 10 * s, AREA_COLOR));
        }

        // --- Perimeter areas (intervallum) ---
        if (settings.renderOutlines) {
            // Mule corrals (north/south intervallum)
            this.append(outlineActor((cx - 20) * s, (WALL_THICKNESS + 2) * s, 40 * s, 10 * s, AREA_COLOR));
            this.append(outlineActor((cx - 20) * s, (OUTER - WALL_THICKNESS - 12) * s, 40 * s, 10 * s, AREA_COLOR));

            // Ovens
            this.append(outlineActor((OUTER - WALL_THICKNESS - 20) * s, (WALL_THICKNESS + 5) * s, 15 * s, 5 * s, AREA_COLOR));
            this.append(outlineActor((WALL_THICKNESS + 5) * s, (OUTER - WALL_THICKNESS - 10) * s, 15 * s, 5 * s, AREA_COLOR));

            // Grazing area (east intervallum)
            this.append(outlineActor(
                (OUTER - WALL_THICKNESS - 13) * s, (OUTER / 3) * s,
                12 * s, 60 * s, AREA_COLOR,
            ));
        }
    }
}
