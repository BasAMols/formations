import PF = require("pathfinding");
import { Vec2 } from "planck";
import type { Actor } from "./element.js";
import type { StaticPhysicsController } from "./physics.js";

export class NavGrid {
    private grid: PF.Grid;
    private finder: PF.AStarFinder;
    private cellSize: number;
    private gridW: number;
    private gridH: number;

    constructor(worldWidth: number, worldHeight: number, cellSize: number = 10) {
        this.cellSize = cellSize;
        this.gridW = Math.ceil(worldWidth / cellSize);
        this.gridH = Math.ceil(worldHeight / cellSize);
        this.grid = new PF.Grid(this.gridW, this.gridH);
        this.finder = new PF.AStarFinder({
            diagonalMovement: PF.DiagonalMovement.IfAtMostOneObstacle,
        });
    }

    rebuild(root: Actor, padding: number = 0): void {
        this.grid = new PF.Grid(this.gridW, this.gridH);
        this.rasterizeActors(root.children, padding);
    }

    findPath(from: Vec2, to: Vec2): Vec2[] {
        const sx = this.clampX(Math.floor(from.x / this.cellSize));
        const sy = this.clampY(Math.floor(from.y / this.cellSize));
        const ex = this.clampX(Math.floor(to.x / this.cellSize));
        const ey = this.clampY(Math.floor(to.y / this.cellSize));

        const work = this.grid.clone();
        work.setWalkableAt(sx, sy, true);
        work.setWalkableAt(ex, ey, true);

        const raw = this.finder.findPath(sx, sy, ex, ey, work);
        if (raw.length < 2) return [];

        const smooth = this.smoothPath(work, raw);

        return smooth.map(([gx, gy]) => new Vec2(
            (gx + 0.5) * this.cellSize,
            (gy + 0.5) * this.cellSize,
        ));
    }

    private smoothPath(grid: PF.Grid, path: number[][]): number[][] {
        if (path.length <= 2) return path;

        const result: number[][] = [path[0]];
        let sx = path[0][0];
        let sy = path[0][1];

        for (let i = 2; i < path.length; i++) {
            if (!this.lineWalkable(grid, sx, sy, path[i][0], path[i][1])) {
                const prev = path[i - 1];
                result.push(prev);
                sx = prev[0];
                sy = prev[1];
            }
        }

        result.push(path[path.length - 1]);
        return result;
    }

    private lineWalkable(grid: PF.Grid, x0: number, y0: number, x1: number, y1: number): boolean {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        let cx = x0;
        let cy = y0;

        while (true) {
            if (!grid.isWalkableAt(cx, cy)) return false;
            if (cx === x1 && cy === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; cx += sx; }
            if (e2 < dx) { err += dx; cy += sy; }
        }
        return true;
    }

    isWalkable(pos: Vec2): boolean {
        const gx = Math.floor(pos.x / this.cellSize);
        const gy = Math.floor(pos.y / this.cellSize);
        if (gx < 0 || gx >= this.gridW || gy < 0 || gy >= this.gridH) return false;
        return this.grid.isWalkableAt(gx, gy);
    }

    findNearestWalkable(pos: Vec2): Vec2 {
        const gx = this.clampX(Math.floor(pos.x / this.cellSize));
        const gy = this.clampY(Math.floor(pos.y / this.cellSize));
        if (this.grid.isWalkableAt(gx, gy)) return pos;

        const visited = new Set<number>();
        const queue: [number, number][] = [[gx, gy]];
        visited.add(gy * this.gridW + gx);

        while (queue.length > 0) {
            const [cx, cy] = queue.shift()!;
            for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx < 0 || nx >= this.gridW || ny < 0 || ny >= this.gridH) continue;
                const key = ny * this.gridW + nx;
                if (visited.has(key)) continue;
                visited.add(key);
                if (this.grid.isWalkableAt(nx, ny)) {
                    return new Vec2((nx + 0.5) * this.cellSize, (ny + 0.5) * this.cellSize);
                }
                queue.push([nx, ny]);
            }
        }
        return pos;
    }

    private rasterizeActors(actors: Actor[], padding: number): void {
        for (const actor of actors) {
            if (!actor.alive) continue;

            const sc = actor.getControllers<StaticPhysicsController>('static-physics')[0];
            if (sc) {
                this.rasterizeBox(actor.position, sc.width, sc.height, padding);
            }

            this.rasterizeActors(actor.children, padding);
        }
    }

    private rasterizeBox(center: Vec2, width: number, height: number, padding: number): void {
        const halfW = width / 2 + padding;
        const halfH = height / 2 + padding;

        const minGx = Math.max(0, Math.floor((center.x - halfW) / this.cellSize));
        const maxGx = Math.min(this.gridW - 1, Math.floor((center.x + halfW) / this.cellSize));
        const minGy = Math.max(0, Math.floor((center.y - halfH) / this.cellSize));
        const maxGy = Math.min(this.gridH - 1, Math.floor((center.y + halfH) / this.cellSize));

        for (let gx = minGx; gx <= maxGx; gx++) {
            for (let gy = minGy; gy <= maxGy; gy++) {
                this.grid.setWalkableAt(gx, gy, false);
            }
        }
    }

    private clampX(v: number): number { return Math.max(0, Math.min(this.gridW - 1, v)); }
    private clampY(v: number): number { return Math.max(0, Math.min(this.gridH - 1, v)); }
}
