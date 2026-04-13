import { Vec2 } from "planck";
import type { Facing, NamedSlot, Rect } from "./plotTypes.js";
import { jitter, rect } from "./plotTypes.js";

export const CENTURION_PADDING = 0.25;
export const CENTURION_INNER_WIDTH = 4.0;
export const CENTURION_INNER_DEPTH = 8.5;
export const CENTURION_WIDTH = CENTURION_INNER_WIDTH + CENTURION_PADDING * 2;   // 5.0
export const CENTURION_DEPTH = CENTURION_INNER_DEPTH + CENTURION_PADDING * 2;   // 9.0

const P = CENTURION_PADDING;

export interface CenturionPlot {
    worldPosition: Vec2;
    facing: Facing;
    plotSize: Vec2;

    tent: Rect;
    vestibule: Rect;

    centurionBed: Vec2;
    servantBed: Vec2;
    deskArea: Vec2;

    namedSlots: NamedSlot[];
}

interface CenturionLayout {
    tent: Rect;
    vestibule: Rect;
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
}

function layoutForFacing(facing: Facing): CenturionLayout {
    switch (facing) {
        case 'south':
            return {
                tent: rect(P, P + 3.0, 4.0, 3.0),
                vestibule: rect(P, P + 6.0, 4.0, 2.0),
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
            };
        case 'north':
            return {
                tent: rect(P, P + 2.0, 4.0, 3.0),
                vestibule: rect(P, P, 4.0, 2.0),
                centurionBed: new Vec2(P + 1.0, P + 3.5),
                servantBed: new Vec2(P + 3.0, P + 3.5),
                deskArea: new Vec2(P + 2.0, P + 4.5),
                weaponRack: new Vec2(P + 1.0, P + 1.0),
                armorStand: new Vec2(P + 3.0, P + 1.0),
                standardsDisplay: new Vec2(P + 2.0, P + 7.4),
                horsePost: new Vec2(P + 0.8, P + 6.6),
                mulePost1: new Vec2(P + 2.0, P + 6.6),
                mulePost2: new Vec2(P + 3.2, P + 6.6),
                feedTrough: new Vec2(P + 2.0, P + 5.8),
            };
        case 'east':
            return {
                tent: rect(P + 3.0, P, 3.0, 4.0),
                vestibule: rect(P + 6.0, P, 2.0, 4.0),
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
            };
        case 'west':
            return {
                tent: rect(P + 2.0, P, 3.0, 4.0),
                vestibule: rect(P, P, 2.0, 4.0),
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
            };
    }
}

function offsetRect(r: Rect, world: Vec2): Rect {
    return {
        position: new Vec2(r.position.x + world.x, r.position.y + world.y),
        size: new Vec2(r.size.x, r.size.y),
    };
}

function offsetVec(v: Vec2, world: Vec2): Vec2 {
    return new Vec2(v.x + world.x, v.y + world.y);
}

export function createCenturionPlot(worldPosition: Vec2, facing: Facing): CenturionPlot {
    const l = layoutForFacing(facing);
    const isHorizontal = facing === 'east' || facing === 'west';
    const plotSize = isHorizontal
        ? new Vec2(CENTURION_DEPTH, CENTURION_WIDTH)
        : new Vec2(CENTURION_WIDTH, CENTURION_DEPTH);

    return {
        worldPosition,
        facing,
        plotSize,
        tent: offsetRect(l.tent, worldPosition),
        vestibule: offsetRect(l.vestibule, worldPosition),
        centurionBed: offsetVec(l.centurionBed, worldPosition),
        servantBed: offsetVec(l.servantBed, worldPosition),
        deskArea: offsetVec(l.deskArea, worldPosition),
        namedSlots: [
            { name: "weaponRack", position: jitter(offsetVec(l.weaponRack, worldPosition), 0.1) },
            { name: "armorStand", position: jitter(offsetVec(l.armorStand, worldPosition), 0.1) },
            { name: "standardsDisplay", position: jitter(offsetVec(l.standardsDisplay, worldPosition), 0.15) },
            { name: "horsePost", position: jitter(offsetVec(l.horsePost, worldPosition), 0.2) },
            { name: "mulePost1", position: jitter(offsetVec(l.mulePost1, worldPosition), 0.2) },
            { name: "mulePost2", position: jitter(offsetVec(l.mulePost2, worldPosition), 0.2) },
            { name: "feedTrough", position: jitter(offsetVec(l.feedTrough, worldPosition), 0.1) },
        ],
    };
}
