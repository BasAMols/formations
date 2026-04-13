import { Vec2 } from "planck";
import { Actor } from "../../../engine/core/actor.js";
import { RenderColor } from "../../../engine/util/color.js";
import { RectRenderer } from "../../../engine/render/rectRenderer.js";
import { OutlineRenderer } from "../../../engine/render/outlineRenderer.js";
import { SlotRenderer } from "../../../engine/render/slotRenderer.js";
import { ObjectRenderer } from "../../../engine/render/objectRenderer.js";
import { CONTUBERNIUM_DEPTH } from "./contuberniumPlot.js";
import { centuryRowLength } from "./centuryPlot.js";
import { LANE_WIDTH, STRIGA_GAP } from "./cohortPlot.js";
import { METERS_TO_PIXELS } from "./contuberniumPlotActor.js";
import { CenturyPlotActor } from "./centuryPlotActor.js";
import { campRenderSettings } from "./campRenderSettings.js";

const COHORT_BOUNDS_COLOR = new RenderColor(0.5, 0.8, 0.55, 0.35);
const COLLAPSED_COLOR = new RenderColor(0.45, 0.6, 0.45, 0.4);
const DRILL_COLOR = new RenderColor(0.7, 0.65, 0.5, 0.3);
const AREA_COLOR = new RenderColor(0.6, 0.6, 0.6, 0.3);

const DRILL_GAP = 2;

function slotChild(pos: Vec2, radius: number): Actor {
    const a = new Actor({ position: pos });
    a.addController(new SlotRenderer(radius));
    return a;
}

function objectChild(pos: Vec2, size: number): Actor {
    const a = new Actor({ position: pos });
    a.addController(new ObjectRenderer(size));
    return a;
}

export class CohortPlotActor extends Actor {
    constructor(x: number, y: number, centuryCount: number, contuberniumCount: number) {
        super({ position: new Vec2(x, y) });

        const settings = campRenderSettings;
        const s = METERS_TO_PIXELS;

        const rowDepth = CONTUBERNIUM_DEPTH;
        const rowLength = centuryRowLength(contuberniumCount);

        const yOffsets: number[] = [];
        const facings: ('south' | 'north')[] = [];
        let yCursor = 0;
        for (let i = 0; i < centuryCount; i++) {
            if (i > 0) {
                yCursor += (i % 2 === 1) ? LANE_WIDTH : STRIGA_GAP;
            }
            yOffsets.push(yCursor);
            facings.push(i % 2 === 0 ? 'south' : 'north');
            yCursor += rowDepth;
        }

        const blockHeight = yCursor;
        const drillFiles = contuberniumCount > 10 ? 14 : 12;
        const drillRanks = contuberniumCount > 10 ? 12 : 7;
        const drillWidth = drillFiles * 1.5;
        const totalWidth = rowLength + DRILL_GAP + drillWidth;

        const totalW = totalWidth * s;
        const totalH = blockHeight * s;

        if (settings.depth >= 3) {
            const fill = new Actor({ position: new Vec2(totalW / 2, totalH / 2) });
            fill.addController(new RectRenderer(totalW, totalH, COLLAPSED_COLOR));
            this.append(fill);
            return;
        }

        if (settings.renderOutlines) {
            const bounds = new Actor({ position: new Vec2(totalW / 2, totalH / 2) });
            bounds.addController(new OutlineRenderer(totalW, totalH, COHORT_BOUNDS_COLOR, 1, true));
            this.append(bounds);
        }

        for (let i = 0; i < centuryCount; i++) {
            this.append(new CenturyPlotActor(0, yOffsets[i] * s, contuberniumCount, facings[i]));
        }

        const drillX = rowLength + DRILL_GAP;
        const drillH = drillRanks * 1;
        if (settings.renderOutlines) {
            const drillActor = new Actor({
                position: new Vec2((drillX + drillWidth / 2) * s, (2 + drillH / 2) * s),
            });
            drillActor.addController(new OutlineRenderer(drillWidth * s, drillH * s, DRILL_COLOR, 1, true));
            this.append(drillActor);
        }

        const gap1CenterY = centuryCount >= 3
            ? (yOffsets[1] + rowDepth + yOffsets[2]) / 2
            : blockHeight / 2;

        if (settings.renderObjects) {
            this.append(objectChild(new Vec2(rowLength / 2 * s, gap1CenterY * s), 0.3 * s));
        }

        if (settings.renderSlots) {
            this.append(slotChild(new Vec2((rowLength / 2 - 1.5) * s, gap1CenterY * s), 0.12 * s));
            this.append(slotChild(new Vec2((rowLength / 2 + 1.5) * s, gap1CenterY * s), 0.12 * s));
        }

        if (settings.renderObjects) {
            this.append(objectChild(new Vec2((rowLength - 2) * s, 2 * s), 0.2 * s));
        }

        if (settings.renderSlots) {
            this.append(slotChild(new Vec2((rowLength - 2) * s, 2 * s), 0.1 * s));
            this.append(slotChild(new Vec2((rowLength - 0.5) * s, 2 * s), 0.1 * s));
        }

        if (settings.renderOutlines) {
            const wsY = gap1CenterY - 1.25;
            const wsActor = new Actor({
                position: new Vec2((2 + 2) * s, (wsY + 1.25) * s),
            });
            wsActor.addController(new OutlineRenderer(4 * s, 2.5 * s, AREA_COLOR, 1, true));
            this.append(wsActor);
        }

        if (settings.renderObjects) {
            for (let i = 0; i < 3; i++) {
                this.append(objectChild(new Vec2((3 + i) * s, gap1CenterY * s), 0.18 * s));
            }
        }

        if (settings.renderOutlines) {
            const latX = rowLength - 10;
            const latActor = new Actor({
                position: new Vec2((latX + 4) * s, (blockHeight - 1) * s),
            });
            latActor.addController(new OutlineRenderer(8 * s, 2 * s, AREA_COLOR, 1, true));
            this.append(latActor);
        }

        if (settings.renderSlots) {
            this.append(slotChild(new Vec2(0, 0), 0.15 * s));
            this.append(slotChild(new Vec2(rowLength * s, 0), 0.15 * s));
            this.append(slotChild(new Vec2(0, blockHeight * s), 0.15 * s));
            this.append(slotChild(new Vec2(rowLength * s, blockHeight * s), 0.15 * s));
        }
    }
}
