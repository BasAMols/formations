import { Vec2 } from "planck";
import { Actor } from "./actor.js";
import { Camera } from "./camera.js";
import { PhysicsManagerController, type PhysicsManagerOptions } from "../physics/physicsManager.js";
import { DisciplineManagerController } from "../module/discipline/disciplineManager.js";

export interface LevelOptions {
    worldWidth: number;
    worldHeight: number;
    cellSize?: number;
    padding?: number;
}

export class Level extends Actor {
    public physics: PhysicsManagerController;
    public camera: Camera;
    public disciplines: DisciplineManagerController;

    constructor(options: LevelOptions) {
        super({ layer: -1 });

        this.camera = new Camera(options.worldWidth, options.worldHeight);

        this.physics = this.addController(new PhysicsManagerController({
            worldWidth: options.worldWidth,
            worldHeight: options.worldHeight,
            cellSize: options.cellSize ?? 8,
            padding: options.padding ?? 32,
        }));

        this.disciplines = this.addController(new DisciplineManagerController());
    }
}
