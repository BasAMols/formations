import { Transform } from "planck";
import type { World } from "planck";
import { Game } from "../game/game.js";
import { Canvas } from "./util/dom/canvas.js";
import { Ticker } from "./core/ticker.js";
import { RenderManager } from "./render/renderManager.js";

const FIXED_DT = 1 / 30;
const MAX_FRAME_TIME = 0.1;

export class Main {
    constructor() {
        const canvas = new Canvas();
        const ticker = new Ticker();
        const game = new Game();
        const renderManager = new RenderManager();

        canvas.camera = game.camera;
        canvas.append(game);

        let accumulator = 0;
        let lastTime = performance.now();

        ticker.add(() => {
            const now = performance.now();
            const frameTime = Math.min((now - lastTime) / 1000, MAX_FRAME_TIME);
            lastTime = now;
            accumulator += frameTime;

            while (accumulator >= FIXED_DT) {
                canvas.logicTick(Transform.identity());
                renderManager.snapshot(canvas);
                accumulator -= FIXED_DT;
            }

            const alpha = accumulator / FIXED_DT;
            canvas.renderFlat(renderManager.interpolate(alpha), game.camera);
        });

        canvas.onClick = (screen) => {
            const world = game.camera.screenToWorld(screen, canvas.size);
            const actors = game.physics.queryPoint(world);
            game.onClick(screen, world, actors);
        };

        window['$'] = {
            canvas: canvas,
            game: game,
            ctx: canvas.ctx,
            ticker: ticker,
            world: game.physics.world,
        }

        document.body.appendChild(canvas.domElement);
        canvas.resize();
        ticker.start();
    }
}

declare global {
    var $: $;
    interface $ {
        game: Game;
        canvas: Canvas;
        ctx: CanvasRenderingContext2D;
        ticker: Ticker;
        world: World;
    }
}
