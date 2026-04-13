import { Vec2 } from "planck";
import type { Facing, NamedSlot, Rect } from "./plotTypes.js";
import { jitter, rect } from "./plotTypes.js";

export const CONTUBERNIUM_PADDING = 0.25;
export const CONTUBERNIUM_INNER_WIDTH = 3.6;
export const CONTUBERNIUM_INNER_DEPTH = 8.5;
export const CONTUBERNIUM_WIDTH = CONTUBERNIUM_INNER_WIDTH + CONTUBERNIUM_PADDING * 2;   // 4.2
export const CONTUBERNIUM_DEPTH = CONTUBERNIUM_INNER_DEPTH + CONTUBERNIUM_PADDING * 2;   // 9.0

const P = CONTUBERNIUM_PADDING;

export interface ContuberniumPlot {
    worldPosition: Vec2;
    facing: Facing;
    plotSize: Vec2;

    tent: Rect;
    vestibule: Rect;

    bedSlots: Vec2[];

    namedSlots: NamedSlot[];
}

function bedGrid(tentOriginX: number, tentOriginY: number, facing: Facing): Vec2[] {
    const slots: Vec2[] = [];
    const colSpacing = 0.6;
    const padX = 0.4;
    const row1Y = 0.9;
    const row2Y = 3.1;

    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            const lx = padX + col * colSpacing;
            const ly = row === 0 ? row1Y : row2Y;
            switch (facing) {
                case 'south':
                    slots.push(new Vec2(tentOriginX + lx, tentOriginY + ly));
                    break;
                case 'north':
                    slots.push(new Vec2(tentOriginX + lx, tentOriginY + (4.0 - ly)));
                    break;
                case 'east':
                    slots.push(new Vec2(tentOriginX + ly, tentOriginY + lx));
                    break;
                case 'west':
                    slots.push(new Vec2(tentOriginX + (4.0 - ly), tentOriginY + lx));
                    break;
            }
        }
    }
    return slots;
}

interface FacingLayout {
    tent: Rect;
    vestibule: Rect;
    mulePostBase: Vec2;
    feedTroughBase: Vec2;
    gearRackBase: Vec2;
}

function layoutForFacing(facing: Facing): FacingLayout {
    switch (facing) {
        case 'south':
            return {
                tent: rect(P, P + 2.0, 3.2, 4.0),
                vestibule: rect(P, P + 6.0, 3.2, 2.0),
                mulePostBase: new Vec2(P + 1.6, P + 0.8),
                feedTroughBase: new Vec2(P + 1.6, P + 1.4),
                gearRackBase: new Vec2(P + 1.6, P + 7.0),
            };
        case 'north':
            return {
                tent: rect(P, P + 2.0, 3.2, 4.0),
                vestibule: rect(P, P, 3.2, 2.0),
                mulePostBase: new Vec2(P + 1.6, P + 7.2),
                feedTroughBase: new Vec2(P + 1.6, P + 6.6),
                gearRackBase: new Vec2(P + 1.6, P + 1.0),
            };
        case 'east':
            return {
                tent: rect(P + 2.0, P, 4.0, 3.2),
                vestibule: rect(P + 6.0, P, 2.0, 3.2),
                mulePostBase: new Vec2(P + 0.8, P + 1.6),
                feedTroughBase: new Vec2(P + 1.4, P + 1.6),
                gearRackBase: new Vec2(P + 7.0, P + 1.6),
            };
        case 'west':
            return {
                tent: rect(P + 2.0, P, 4.0, 3.2),
                vestibule: rect(P, P, 2.0, 3.2),
                mulePostBase: new Vec2(P + 7.2, P + 1.6),
                feedTroughBase: new Vec2(P + 6.6, P + 1.6),
                gearRackBase: new Vec2(P + 1.0, P + 1.6),
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

export function createContuberniumPlot(worldPosition: Vec2, facing: Facing): ContuberniumPlot {
    const layout = layoutForFacing(facing);
    const tentOrigin = new Vec2(
        layout.tent.position.x + worldPosition.x,
        layout.tent.position.y + worldPosition.y,
    );

    const isHorizontal = facing === 'east' || facing === 'west';
    const plotSize = isHorizontal
        ? new Vec2(CONTUBERNIUM_DEPTH, CONTUBERNIUM_WIDTH)
        : new Vec2(CONTUBERNIUM_WIDTH, CONTUBERNIUM_DEPTH);

    return {
        worldPosition,
        facing,
        plotSize,
        tent: offsetRect(layout.tent, worldPosition),
        vestibule: offsetRect(layout.vestibule, worldPosition),
        bedSlots: bedGrid(tentOrigin.x, tentOrigin.y, facing),
        namedSlots: [
            { name: "mulePost", position: jitter(offsetVec(layout.mulePostBase, worldPosition), 0.2) },
            { name: "feedTrough", position: jitter(offsetVec(layout.feedTroughBase, worldPosition), 0.1) },
            { name: "gearRack", position: jitter(offsetVec(layout.gearRackBase, worldPosition), 0.1) },
        ],
    };
}

export function createSigniferPlot(worldPosition: Vec2, facing: Facing): ContuberniumPlot {
    const plot = createContuberniumPlot(worldPosition, facing);
    const layout = layoutForFacing(facing);
    plot.namedSlots = [
        { name: "payChest", position: jitter(offsetVec(layout.gearRackBase, worldPosition), 0.1) },
        { name: "standardsRack", position: jitter(offsetVec(layout.mulePostBase, worldPosition), 0.15) },
    ];
    return plot;
}

export function createOptioPlot(worldPosition: Vec2, facing: Facing): ContuberniumPlot {
    const plot = createContuberniumPlot(worldPosition, facing);
    const layout = layoutForFacing(facing);
    plot.namedSlots = [
        { name: "watchBoard", position: jitter(offsetVec(layout.gearRackBase, worldPosition), 0.1) },
        { name: "weaponRack", position: jitter(offsetVec(layout.mulePostBase, worldPosition), 0.1) },
    ];
    return plot;
}
