import { Vec2 } from "planck";
import { Actor } from "../../../engine/core/actor.js";
import { RenderColor } from "../../../engine/util/color.js";
import { RectRenderer } from "../../../engine/render/rectRenderer.js";
import { OutlineRenderer } from "../../../engine/render/outlineRenderer.js";
import type { Facing } from "./plotTypes.js";
import { CONTUBERNIUM_WIDTH, CONTUBERNIUM_DEPTH } from "./contuberniumPlot.js";
import { CENTURION_WIDTH } from "./centurionPlot.js";
import { PLOT_SPACING } from "./centuryPlot.js";
import { METERS_TO_PIXELS, ContuberniumPlotActor } from "./contuberniumPlotActor.js";
import { CenturionPlotActor } from "./centurionPlotActor.js";
import { campRenderSettings } from "./campRenderSettings.js";

const CENTURY_BOUNDS_COLOR = new RenderColor(0.6, 0.7, 0.9, 0.4);
const COLLAPSED_COLOR = new RenderColor(0.5, 0.55, 0.65, 0.45);

export class CenturyPlotActor extends Actor {
    constructor(x: number, y: number, contuberniumCount: number, facing: Facing) {
        super({ position: new Vec2(x, y) });

        const settings = campRenderSettings;
        const s = METERS_TO_PIXELS;
        const isHorizontal = facing === 'south' || facing === 'north';
        const sp = PLOT_SPACING;

        const plotCount = 3 + contuberniumCount;
        const rowLength = CENTURION_WIDTH + CONTUBERNIUM_WIDTH * (2 + contuberniumCount)
            + sp * (plotCount - 1);
        const rowDepth = CONTUBERNIUM_DEPTH;

        const totalW = (isHorizontal ? rowLength : rowDepth) * s;
        const totalH = (isHorizontal ? rowDepth : rowLength) * s;

        if (settings.depth >= 2) {
            const fill = new Actor({ position: new Vec2(totalW / 2, totalH / 2) });
            fill.addController(new RectRenderer(totalW, totalH, COLLAPSED_COLOR));
            this.append(fill);
            return;
        }

        if (settings.renderOutlines) {
            const bounds = new Actor({ position: new Vec2(totalW / 2, totalH / 2) });
            bounds.addController(new OutlineRenderer(totalW, totalH, CENTURY_BOUNDS_COLOR, 1, true));
            this.append(bounds);
        }

        let cursor = 0;

        const cenPos = isHorizontal ? new Vec2(cursor * s, 0) : new Vec2(0, cursor * s);
        this.append(new CenturionPlotActor(cenPos.x, cenPos.y, facing));
        cursor += CENTURION_WIDTH + sp;

        const sigPos = isHorizontal ? new Vec2(cursor * s, 0) : new Vec2(0, cursor * s);
        this.append(new ContuberniumPlotActor(sigPos.x, sigPos.y, facing));
        cursor += CONTUBERNIUM_WIDTH + sp;

        for (let i = 0; i < contuberniumCount; i++) {
            const pos = isHorizontal ? new Vec2(cursor * s, 0) : new Vec2(0, cursor * s);
            this.append(new ContuberniumPlotActor(pos.x, pos.y, facing));
            cursor += CONTUBERNIUM_WIDTH + sp;
        }

        const optPos = isHorizontal ? new Vec2(cursor * s, 0) : new Vec2(0, cursor * s);
        this.append(new ContuberniumPlotActor(optPos.x, optPos.y, facing));
    }
}
