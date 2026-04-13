import { Vec2 } from "planck";
import { Actor } from "../../../engine/core/actor.js";
import { RenderColor } from "../../../engine/util/color.js";
import { RectRenderer } from "../../../engine/render/rectRenderer.js";
import { OutlineRenderer } from "../../../engine/render/outlineRenderer.js";
import { SlotRenderer } from "../../../engine/render/slotRenderer.js";
import { ObjectRenderer } from "../../../engine/render/objectRenderer.js";
import { BedActor } from "./bedActor.js";
import type { Facing } from "./plotTypes.js";
import { jitter } from "./plotTypes.js";
import {
    CONTUBERNIUM_WIDTH, CONTUBERNIUM_DEPTH,
    CONTUBERNIUM_PADDING,
} from "./contuberniumPlot.js";
import { campRenderSettings } from "./campRenderSettings.js";

export const METERS_TO_PIXELS = 50;

const BOUNDS_COLOR = new RenderColor(0.8, 0.8, 0.8, 0.6);
const COLLAPSED_COLOR = new RenderColor(0.65, 0.55, 0.4, 0.5);
const TENT_COLOR = new RenderColor(0.6, 0.45, 0.3, 1);
const VESTIBULE_COLOR = new RenderColor(0.7, 0.55, 0.35, 0.8);

const P = CONTUBERNIUM_PADDING;

interface LocalLayout {
    plotW: number; plotH: number;
    tentPos: Vec2; tentW: number; tentH: number;
    vestPos: Vec2; vestW: number; vestH: number;
    mulePostBase: Vec2;
    feedTroughBase: Vec2;
    gearRackBase: Vec2;
    tentOrigin: Vec2;
    bedAngle: number;
}

function localLayout(facing: Facing): LocalLayout {
    switch (facing) {
        case 'south': return {
            plotW: CONTUBERNIUM_WIDTH, plotH: CONTUBERNIUM_DEPTH,
            tentPos: new Vec2(P, P + 2.0), tentW: 3.6, tentH: 4.0,
            vestPos: new Vec2(P, P + 6.0), vestW: 3.6, vestH: 2.0,
            mulePostBase: new Vec2(P + 1.6, P + 0.8),
            feedTroughBase: new Vec2(P + 1.6, P + 1.4),
            gearRackBase: new Vec2(P + 1.6, P + 7.0),
            tentOrigin: new Vec2(P, P + 2.0),
            bedAngle: 0,
        };
        case 'north': return {
            plotW: CONTUBERNIUM_WIDTH, plotH: CONTUBERNIUM_DEPTH,
            tentPos: new Vec2(P, P + 2.0), tentW: 3.6, tentH: 4.0,
            vestPos: new Vec2(P, P), vestW: 3.6, vestH: 2.0,
            mulePostBase: new Vec2(P + 1.6, P + 7.2),
            feedTroughBase: new Vec2(P + 1.6, P + 6.6),
            gearRackBase: new Vec2(P + 1.6, P + 1.0),
            tentOrigin: new Vec2(P, P + 2.0),
            bedAngle: 0,
        };
        case 'east': return {
            plotW: CONTUBERNIUM_DEPTH, plotH: CONTUBERNIUM_WIDTH,
            tentPos: new Vec2(P + 2.0, P), tentW: 4.0, tentH: 3.6,
            vestPos: new Vec2(P + 6.0, P), vestW: 2.0, vestH: 3.6,
            mulePostBase: new Vec2(P + 0.8, P + 1.6),
            feedTroughBase: new Vec2(P + 1.4, P + 1.6),
            gearRackBase: new Vec2(P + 7.0, P + 1.6),
            tentOrigin: new Vec2(P + 2.0, P),
            bedAngle: Math.PI / 2,
        };
        case 'west': return {
            plotW: CONTUBERNIUM_DEPTH, plotH: CONTUBERNIUM_WIDTH,
            tentPos: new Vec2(P + 2.0, P), tentW: 4.0, tentH: 3.6,
            vestPos: new Vec2(P, P), vestW: 2.0, vestH: 3.6,
            mulePostBase: new Vec2(P + 7.2, P + 1.6),
            feedTroughBase: new Vec2(P + 6.6, P + 1.6),
            gearRackBase: new Vec2(P + 1.0, P + 1.6),
            tentOrigin: new Vec2(P + 2.0, P),
            bedAngle: Math.PI / 2,
        };
    }
}

function localBedGrid(tentOriginX: number, tentOriginY: number, facing: Facing, s: number): Vec2[] {
    const slots: Vec2[] = [];
    const colSpacing = 0.7;
    const padX = 0.4;
    const row1Y = 0.9;
    const row2Y = 3.1;

    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            const lx = padX + col * colSpacing;
            const ly = row === 0 ? row1Y : row2Y;
            switch (facing) {
                case 'south':
                    slots.push(new Vec2((tentOriginX + lx) * s, (tentOriginY + ly) * s));
                    break;
                case 'north':
                    slots.push(new Vec2((tentOriginX + lx) * s, (tentOriginY + (4.0 - ly)) * s));
                    break;
                case 'east':
                    slots.push(new Vec2((tentOriginX + ly) * s, (tentOriginY + lx) * s));
                    break;
                case 'west':
                    slots.push(new Vec2((tentOriginX + (4.0 - ly)) * s, (tentOriginY + lx) * s));
                    break;
            }
        }
    }
    return slots;
}

function sv(v: Vec2, s: number): Vec2 {
    return new Vec2(v.x * s, v.y * s);
}

function rectChild(x: number, y: number, w: number, h: number, color: RenderColor): Actor {
    const a = new Actor({ position: new Vec2(x + w / 2, y + h / 2) });
    a.addController(new RectRenderer(w, h, color));
    return a;
}

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

export class ContuberniumPlotActor extends Actor {
    constructor(x: number, y: number, facing: Facing) {
        super({ position: new Vec2(x, y) });

        const settings = campRenderSettings;
        const s = METERS_TO_PIXELS;
        const l = localLayout(facing);
        const plotW = l.plotW * s;
        const plotH = l.plotH * s;

        if (settings.depth >= 1) {
            const fill = new Actor({ position: new Vec2(plotW / 2, plotH / 2) });
            fill.addController(new RectRenderer(plotW, plotH, COLLAPSED_COLOR));
            this.append(fill);
            return;
        }

        if (settings.renderOutlines) {
            const bounds = new Actor({ position: new Vec2(plotW / 2, plotH / 2) });
            bounds.addController(new OutlineRenderer(plotW, plotH, BOUNDS_COLOR, 2, true));
            this.append(bounds);
        }

        this.append(rectChild(l.tentPos.x * s, l.tentPos.y * s, l.tentW * s, l.tentH * s, TENT_COLOR));
        this.append(rectChild(l.vestPos.x * s, l.vestPos.y * s, l.vestW * s, l.vestH * s, VESTIBULE_COLOR));

        for (const bed of localBedGrid(l.tentOrigin.x, l.tentOrigin.y, facing, s)) {
            this.append(new BedActor(bed.x, bed.y, l.bedAngle, s));
        }

        if (settings.renderSlots) {
            this.append(slotChild(sv(jitter(l.mulePostBase, 0.2), s), 0.15 * s));
        }
        if (settings.renderObjects) {
            this.append(objectChild(sv(jitter(l.feedTroughBase, 0.1), s), 0.2 * s));
            this.append(objectChild(sv(jitter(l.gearRackBase, 0.1), s), 0.2 * s));
        }
    }
}
