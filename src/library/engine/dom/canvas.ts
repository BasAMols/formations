import { Vec2 } from "planck";
import type { RenderController } from "../controller.js";
import type { Actor } from "../element.js";
import { Dom } from "./dom.js";
import { Renderer } from "./ren.js";

export class Canvas extends Dom<'canvas'> {
    public ctx: CanvasRenderingContext2D;
    private renderer: Renderer;

    public get draw(): Renderer['draw'] {
        return this.renderer.draw;
    }
    public get clear(): Renderer['clear'] {
        return this.renderer.clear;
    }
    public get size(): Vec2 {
        return new Vec2(this._domElement.clientWidth, this._domElement.clientHeight);
    }
    constructor() {
        super('canvas');

        window.addEventListener('resize', () => {
            this.resize();
        });

        this.ctx = this._domElement.getContext('2d')!;
        this.renderer = new Renderer(this);
    }

    resize() {
        this._domElement.width = window.innerWidth;
        this._domElement.height = window.innerHeight;
        this._domElement.style.width = `${window.innerWidth}px`;
        this._domElement.style.height = `${window.innerHeight}px`;
    }

    renderFlat(renderables: Actor[]): void {
        this.clear.all();
        renderables.sort((a, b) => (a.layer - b.layer) || (a.treeOrder - b.treeOrder));
        for (const actor of renderables) {
            this.ctx.save();
            const p = actor.worldTransform.p;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(actor.worldTransform.q.getAngle());
            for (const c of actor.getControllers<RenderController>('render')) {
                c.render(actor, this);
            }
            this.ctx.restore();
        }
    }
}
