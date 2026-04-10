import { Vec2 } from "planck";
import { RenderColor } from "../library/engine/color.js";
import { Camera } from "../library/engine/camera.js";
import { RenderController } from "../library/engine/controller.js";
import type { Canvas } from "../library/engine/dom/canvas.js";
import { Actor } from "../library/engine/element.js";
import { PhysicsManagerController } from "../library/engine/physics.js";
import { DisciplineManagerController } from "./disciplines/manager.js";
import { Squad } from "./disciplines/examples/leader.js";
import { NullUnit } from "./disciplines/examples/null.js";
import { PatrolUnit } from "./disciplines/examples/patrol.js";
import { Wall } from "./wall.js";

class BackgroundRenderer extends RenderController {
    render(_actor: Actor, canvas: Canvas): void {
        canvas.draw.rect(Vec2.zero(), canvas.size, RenderColor.black());
    }
}

export class Game extends Actor {
    public physics: PhysicsManagerController;
    public camera: Camera;

    constructor() {
        super({ layer: -1 });

        this.camera = new Camera(3072, 1559);
        this.addController(new BackgroundRenderer());

        this.physics = this.addController(new PhysicsManagerController({
            worldWidth: 3072,
            worldHeight: 1559,
            cellSize: 8,
            padding: 32,
        }));
        this.addController(new DisciplineManagerController());

        this.buildLevel();

        this.physics.rebuildNavGrid(this);

        this.append(new Squad(300, 400));
        this.append(new NullUnit(2700, 1200));

        // this.append(new PatrolUnit(200, 1400, [
        //     new Vec2(2800, 200),
        //     new Vec2(2800, 1400),
        //     new Vec2(200, 1400),
        //     new Vec2(200, 200),
        // ]));

        // this.append(new PatrolUnit(2900, 780, [
        //     new Vec2(200, 780),
        //     new Vec2(2900, 780),
        // ]));
    }

    private buildLevel(): void {
        const W = 3072;
        const H = 1559;
        const T = 20;

        // Border walls
        this.append(new Wall(W / 2, T / 2, W, T));
        this.append(new Wall(W / 2, H - T / 2, W, T));
        this.append(new Wall(T / 2, H / 2, T, H));
        this.append(new Wall(W - T / 2, H / 2, T, H));

        // Central vertical wall with a gap in the middle
        this.append(new Wall(1536, 300, 40, 500));
        this.append(new Wall(1536, 1100, 40, 500));

        // Left side: horizontal corridor walls
        this.append(new Wall(500, 500, 600, 40));
        this.append(new Wall(500, 900, 400, 40));

        // Right side: staggered walls creating a zigzag
        this.append(new Wall(2100, 400, 40, 500));
        this.append(new Wall(2500, 700, 40, 600));
        this.append(new Wall(2100, 1100, 500, 40));

        // Small obstacles scattered around
        this.append(new Wall(800, 1300, 200, 60));
        this.append(new Wall(1200, 200, 60, 200));
        this.append(new Wall(2800, 300, 150, 150, RenderColor.gray(0.4)));
        this.append(new Wall(400, 300, 100, 100, RenderColor.gray(0.4)));

        // Chokepoint pillars near center gap
        this.append(new Wall(1400, 700, 80, 80, RenderColor.gray(0.4)));
        this.append(new Wall(1670, 700, 80, 80, RenderColor.gray(0.4)));
    }

    onClick(screen: Vec2, world: Vec2, actors: Actor[]): void {
        console.log('click', { screen, world, actors });
    }
}
