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
import { CENTURION_WIDTH, CENTURION_DEPTH, CENTURION_PADDING } from "./centurionPlot.js";
import { METERS_TO_PIXELS } from "./contuberniumPlotActor.js";
import { campRenderSettings } from "./campRenderSettings.js";

const BOUNDS_COLOR = new RenderColor(0.8, 0.8, 0.8, 0.6);
const COLLAPSED_COLOR = new RenderColor(0.65, 0.55, 0.4, 0.5);
const TENT_COLOR = new RenderColor(0.55, 0.4, 0.25, 1);
const VESTIBULE_COLOR = new RenderColor(0.65, 0.5, 0.3, 0.8);

const P = CENTURION_PADDING;

interface LocalLayout {
    plotW: number; plotH: number;
    tentPos: Vec2; tentW: number; tentH: number;
    vestPos: Vec2; vestW: number; vestH: number;
    centurionBed: Vec2;
    servantBed: Vec2;
    deskArea: Vec2;
    weaponRack: Vec2;
    armorStand: Vec2;
    standardsDisplay: Vec2;
    horsePost: Vec2;
    mulePost1: Vec2;
    mulePost2: Vec2;
    feedTrough: Vec2;
    bedAngle: number;
}

function localLayout(facing: Facing): LocalLayout {
    switch (facing) {
        case 'south': return {
            plotW: CENTURION_WIDTH, plotH: CENTURION_DEPTH,
            tentPos: new Vec2(P, P + 3.0), tentW: 4.0, tentH: 3.0,
            vestPos: new Vec2(P, P + 6.0), vestW: 4.0, vestH: 2.0,
            centurionBed: new Vec2(P + 1.0, P + 4.5),
            servantBed: new Vec2(P + 3.0, P + 4.5),
            deskArea: new Vec2(P + 2.0, P + 3.5),
            weaponRack: new Vec2(P + 1.0, P + 7.0),
            armorStand: new Vec2(P + 3.0, P + 7.0),
            standardsDisplay: new Vec2(P + 2.0, P + 0.6),
            horsePost: new Vec2(P + 0.8, P + 1.4),
            mulePost1: new Vec2(P + 2.0, P + 1.4),
            mulePost2: new Vec2(P + 3.2, P + 1.4),
            feedTrough: new Vec2(P + 2.0, P + 2.2),
            bedAngle: 0,
        };
        case 'north': return {
            plotW: CENTURION_WIDTH, plotH: CENTURION_DEPTH,
            tentPos: new Vec2(P, P + 2.0), tentW: 4.0, tentH: 3.0,
            vestPos: new Vec2(P, P), vestW: 4.0, vestH: 2.0,
            centurionBed: new Vec2(P + 1.0, P + 3.5),
            servantBed: new Vec2(P + 3.0, P + 3.5),
            deskArea: new Vec2(P + 2.0, P + 4.0),
            weaponRack: new Vec2(P + 1.0, P + 1.0),
            armorStand: new Vec2(P + 3.0, P + 1.0),
            standardsDisplay: new Vec2(P + 2.0, P + 7.4),
            horsePost: new Vec2(P + 0.8, P + 6.6),
            mulePost1: new Vec2(P + 2.0, P + 6.6),
            mulePost2: new Vec2(P + 3.2, P + 6.6),
            feedTrough: new Vec2(P + 2.0, P + 5.8),
            bedAngle: 0,
        };
        case 'east': return {
            plotW: CENTURION_DEPTH, plotH: CENTURION_WIDTH,
            tentPos: new Vec2(P + 3.0, P), tentW: 3.0, tentH: 4.0,
            vestPos: new Vec2(P + 6.0, P), vestW: 2.0, vestH: 4.0,
            centurionBed: new Vec2(P + 4.5, P + 1.0),
            servantBed: new Vec2(P + 4.5, P + 3.0),
            deskArea: new Vec2(P + 3.5, P + 2.0),
            weaponRack: new Vec2(P + 7.0, P + 1.0),
            armorStand: new Vec2(P + 7.0, P + 3.0),
            standardsDisplay: new Vec2(P + 0.6, P + 2.0),
            horsePost: new Vec2(P + 1.4, P + 0.8),
            mulePost1: new Vec2(P + 1.4, P + 2.0),
            mulePost2: new Vec2(P + 1.4, P + 3.2),
            feedTrough: new Vec2(P + 2.2, P + 2.0),
            bedAngle: Math.PI / 2,
        };
        case 'west': return {
            plotW: CENTURION_DEPTH, plotH: CENTURION_WIDTH,
            tentPos: new Vec2(P + 2.0, P), tentW: 3.0, tentH: 4.0,
            vestPos: new Vec2(P, P), vestW: 2.0, vestH: 4.0,
            centurionBed: new Vec2(P + 3.5, P + 1.0),
            servantBed: new Vec2(P + 3.5, P + 3.0),
            deskArea: new Vec2(P + 4.5, P + 2.0),
            weaponRack: new Vec2(P + 1.0, P + 1.0),
            armorStand: new Vec2(P + 1.0, P + 3.0),
            standardsDisplay: new Vec2(P + 7.4, P + 2.0),
            horsePost: new Vec2(P + 6.6, P + 0.8),
            mulePost1: new Vec2(P + 6.6, P + 2.0),
            mulePost2: new Vec2(P + 6.6, P + 3.2),
            feedTrough: new Vec2(P + 5.8, P + 2.0),
            bedAngle: Math.PI / 2,
        };
    }
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

export class CenturionPlotActor extends Actor {
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

        this.append(new BedActor(l.centurionBed.x * s, l.centurionBed.y * s, l.bedAngle, s));
        this.append(new BedActor(l.servantBed.x * s, l.servantBed.y * s, l.bedAngle, s));

        if (settings.renderObjects) {
            this.append(objectChild(sv(jitter(l.deskArea, 0.1), s), 0.24 * s));
            this.append(objectChild(sv(jitter(l.weaponRack, 0.1), s), 0.2 * s));
            this.append(objectChild(sv(jitter(l.armorStand, 0.1), s), 0.2 * s));
            this.append(objectChild(sv(jitter(l.standardsDisplay, 0.15), s), 0.24 * s));
        }
        if (settings.renderSlots) {
            this.append(slotChild(sv(jitter(l.horsePost, 0.2), s), 0.18 * s));
            this.append(slotChild(sv(jitter(l.mulePost1, 0.2), s), 0.15 * s));
            this.append(slotChild(sv(jitter(l.mulePost2, 0.2), s), 0.15 * s));
        }
        if (settings.renderObjects) {
            this.append(objectChild(sv(jitter(l.feedTrough, 0.1), s), 0.2 * s));
        }
    }
}
