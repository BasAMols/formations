import { Canvas } from "./dom/canvas.js";
import { Ticker } from "./tick.js";

export class Main {
    constructor() {
        const canvas = new Canvas();
        document.body.appendChild(canvas.domElement);
        const ticker = new Ticker();
        ticker.add(() => {
            canvas.gameTick();
            canvas.gameRender(canvas);
        });
        ticker.start();
        canvas.resize();
    }
}