import { Vec2 } from "planck";
import { RenderColor } from "../../engine/util/color.js";
import { Level } from "../../engine/core/level.js";
import { Wall } from "../actors/wall.js";
import { Squad } from "../actors/soldiers/squadUnit.js";
import { NullUnit } from "../actors/soldiers/null/nullUnit.js";
import { campRenderSettings } from "../roman/camp/campRenderSettings.js";
import { CampLayoutActor } from "../roman/camp/campLayoutActor.js";
import { OUTER } from "../roman/camp/campLayout.js";
import { METERS_TO_PIXELS } from "../roman/camp/contuberniumPlotActor.js";
import { RenderController } from "../../engine/controller/renderController.js";
import { Actor } from "../../engine/core/actor.js";
import { Canvas } from "../../engine/util/dom/canvas.js";

class BackgroundRenderer extends RenderController {
    render(_actor: Actor, canvas: Canvas): void {
        canvas.draw.rect(Vec2.zero(), new Vec2(this.width, this.height), new RenderColor(1, 1, 1, 1));
    }
    constructor(private width: number, private height: number) {
        super();
    }
}

export class MainLevel extends Level {
    constructor() {
        const campPixels = OUTER * METERS_TO_PIXELS;
        const margin = 100;
        const W = campPixels + margin * 2;
        const H = campPixels + margin * 2;

        super({ worldWidth: W, worldHeight: H, cellSize: 8, padding: 32 });
        this.addController(new BackgroundRenderer(W, H));

        campRenderSettings.depth = 0;
        this.append(new CampLayoutActor(margin, margin));
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
