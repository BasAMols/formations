import { Vec2 } from "planck";
import type { RenderController } from "../../controller/renderController.js";
import type { Camera } from "../../core/camera.js";
import type { Actor } from "../../core/actor.js";
import { Dom } from "./dom.js";
import { Renderer } from "./renderer.js";

export class Canvas extends Dom<'canvas'> {
    public ctx: CanvasRenderingContext2D;
    private renderer: Renderer;
    public camera?: Camera;
    public onClick?: (screenPos: Vec2) => void;

    private _panning = false;

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

        this._domElement.addEventListener('click', (e: MouseEvent) => {
            this.onClick?.(new Vec2(e.offsetX, e.offsetY));
        });

        this._domElement.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            if (!this.camera) return;
            const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
            this.camera.zoomAt(new Vec2(e.offsetX, e.offsetY), factor, this.size);
        }, { passive: false });

        this._domElement.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.button === 2) this._panning = true;
        });

        this._domElement.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this._panning || !this.camera) return;
            this.camera.pan(new Vec2(e.movementX, e.movementY));
        });

        window.addEventListener('mouseup', (e: MouseEvent) => {
            if (e.button === 2) this._panning = false;
        });

        this._domElement.addEventListener('contextmenu', (e: Event) => {
            e.preventDefault();
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

    renderFlat(renderables: Actor[], camera?: Camera): void {
        this.clear.all();
        renderables.sort((a, b) => (a.layer - b.layer) || (a.treeOrder - b.treeOrder));

        if (camera) {
            this.ctx.save();
            this.ctx.scale(camera.zoom, camera.zoom);
            this.ctx.translate(-camera.offset.x, -camera.offset.y);
        }

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

        if (camera) {
            this.ctx.restore();
        }
    }
}
