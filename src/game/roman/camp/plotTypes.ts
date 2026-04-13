import { Vec2 } from "planck";

export type Facing = 'north' | 'south' | 'east' | 'west';

export interface Rect {
    position: Vec2;
    size: Vec2;
}

export interface NamedSlot {
    name: string;
    position: Vec2;
}

export interface FormationGrid {
    origin: Vec2;
    files: number;
    ranks: number;
    fileSpacing: number;
    rankSpacing: number;
}

export function getFormationPosition(grid: FormationGrid, file: number, rank: number): Vec2 {
    return new Vec2(
        grid.origin.x + file * grid.fileSpacing,
        grid.origin.y + rank * grid.rankSpacing,
    );
}

export function jitter(base: Vec2, amount: number): Vec2 {
    return new Vec2(
        base.x + (Math.random() - 0.5) * 2 * amount,
        base.y + (Math.random() - 0.5) * 2 * amount,
    );
}

export function rect(x: number, y: number, w: number, h: number): Rect {
    return { position: new Vec2(x, y), size: new Vec2(w, h) };
}
