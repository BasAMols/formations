import { Vec2 } from "planck";
import { RenderColor } from "../../engine/util/color.js";
import { Level } from "../../engine/core/level.js";
import { Wall } from "../actors/wall.js";
import { Squad } from "../actors/soldiers/squadUnit.js";
import { NullUnit } from "../actors/soldiers/null/nullUnit.js";

export class MainLevel extends Level {
    constructor() {
        const W = 3072 * 2;
        const H = 1559 * 2;

        super({ worldWidth: W, worldHeight: H, cellSize: 8, padding: 32 });

        this.buildWalls(W, H);
        this.physics.rebuildNavGrid(this);

        this.append(new Squad(300, 400));
        this.append(new NullUnit(2700, 1200));
    }

    private buildWalls(W: number, H: number): void {
        const T = 20;

        this.append(new Wall(W / 2, T / 2, W, T));
        this.append(new Wall(W / 2, H - T / 2, W, T));
        this.append(new Wall(T / 2, H / 2, T, H));
        this.append(new Wall(W - T / 2, H / 2, T, H));

        this.append(new Wall(1536, 300, 40, 500));
        this.append(new Wall(1536, 1100, 40, 500));

        this.append(new Wall(500, 500, 600, 40));
        this.append(new Wall(500, 900, 400, 40));

        this.append(new Wall(2100, 400, 40, 500));
        this.append(new Wall(2500, 700, 40, 600));
        this.append(new Wall(2100, 1100, 500, 40));

        this.append(new Wall(800, 1300, 200, 60));
        this.append(new Wall(1200, 200, 60, 200));
        this.append(new Wall(2800, 300, 150, 150, RenderColor.gray(0.4)));
        this.append(new Wall(400, 300, 100, 100, RenderColor.gray(0.4)));

        this.append(new Wall(1400, 700, 80, 80, RenderColor.gray(0.4)));
        this.append(new Wall(1670, 700, 80, 80, RenderColor.gray(0.4)));
    }
}
