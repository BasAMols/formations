import { Game } from "../../unit/game.js";
import { Canvas } from "./dom/canvas.js";
import { Ticker } from "./tick.js";

export class Main {
    constructor() {
        const canvas = new Canvas();
        const ticker = new Ticker();
        const game = new Game();
        ticker.add(() => {
            canvas.gameTick();
            canvas.gameRender(canvas);
        });
        canvas.append(game);
        
        window['$'] = {
            canvas: canvas,
            game: game,
            ctx: canvas.ctx,
            ticker: ticker,
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
    }
}

