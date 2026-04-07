
import { RenderColor } from "../color.js";
import { Vector2 } from "../math/vector2.js";
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
    public get size(): Vector2 {
        return new Vector2(this._domElement.clientWidth, this._domElement.clientHeight);
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

    preRender(): void {
        super.preRender(this);
        this.clear.all();
    }
}