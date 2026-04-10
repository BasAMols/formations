import { Transform } from "planck";
import type { World } from "planck";
import { Game } from "../../unit/game.js";
import type { Actor } from "./element.js";
import { Canvas } from "./dom/canvas.js";
import { Ticker } from "./tick.js";

export class Main {
    constructor() {
        const canvas = new Canvas();
        const ticker = new Ticker();
        const game = new Game();
        canvas.append(game);

        ticker.add(() => {
            const renderables: Actor[] = [];
            canvas.logicTick(Transform.identity(), renderables);
            canvas.renderFlat(renderables);
        });

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
