import type { Canvas } from "../dom/canvas.js";
import { Vector2 } from "./vector2.js";

export class Transform {
    public position: Vector2;
    public rotation: number;
    public scale: Vector2;
    public size: Vector2;
    public anchorPoint: Vector2;
    constructor() {
        this.position = new Vector2(0, 0);
        this.rotation = 0;
        this.scale = new Vector2(1, 1);
        this.size = new Vector2(1, 1);
        this.anchorPoint = new Vector2(0.5, 0.5);
    }

    apply(canvas: Canvas) {
        const pivotX = this.position.x + this.anchorPoint.x * this.size.x;
        const pivotY = this.position.y + this.anchorPoint.y * this.size.y;
        canvas.ctx?.translate(pivotX, pivotY);
        canvas.ctx?.rotate(this.rotation);
        canvas.ctx?.scale(this.scale.x, this.scale.y);
        canvas.ctx?.translate(-this.anchorPoint.x * this.size.x, -this.anchorPoint.y * this.size.y);
    }

    reverse(canvas: Canvas) {
        canvas.ctx?.translate(this.anchorPoint.x * this.size.x, this.anchorPoint.y * this.size.y);
        canvas.ctx?.scale(1 / this.scale.x, 1 / this.scale.y);
        canvas.ctx?.rotate(-this.rotation);
        canvas.ctx?.translate(
            -(this.position.x + this.anchorPoint.x * this.size.x),
            -(this.position.y + this.anchorPoint.y * this.size.y)
        );
    }
}