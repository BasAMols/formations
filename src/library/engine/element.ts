import type { Canvas } from "./dom/canvas.js";
import { Transform } from "./math/transform.js";

export class Actor {
    protected children: Actor[] = [];
    protected _alive: boolean = true;
    protected transform: Transform;
    constructor() {
        this.transform = new Transform();
    }

    append(element: Actor) {
        this.children.push(element);
        return element;
    }
    child() {
        const element = new Actor();
        this.append(element);
        return element;
    }
    destroy() {
        this._alive = false;
        this.children.forEach(child => {
            child.destroy();
        });
    }
    gameTick() {
        if (!this._alive) return;
        this.preTick();
        this.children = this.children.filter(child => child._alive);
        this.children.forEach(child => child.gameTick());
        this.tick();
    }
    preTick(): void {
        // void
    }
    tick(): void {
        // void
    }
    
    preTransform(canvas: Canvas): void {
        canvas.ctx?.save();
        this.transform.apply(canvas);
    }

    postTransform(canvas: Canvas): void {
        canvas.ctx?.restore();
    }

    gameRender(canvas: Canvas) {
        this.preTransform(canvas);
        this.preRender(canvas);
        this.render(canvas);
        this.children.forEach(child => child.gameRender(canvas));
        this.postTransform(canvas);
    }
    preRender(canvas: Canvas): void {
        // void
    }
    render(canvas: Canvas): void {
        // void
    }
}