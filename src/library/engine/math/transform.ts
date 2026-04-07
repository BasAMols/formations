import type { Canvas } from "../dom/canvas.js";
import { Vector2 } from "./vector2.js";

export interface TransformProps {
    position?: Vector2;
    rotation?: number;
    scale?: Vector2;
    size?: Vector2;
    anchorPoint?: Vector2;
}

export class Transform {
    public position: Vector2;
    public rotation: number;
    public scale: Vector2;
    public size: Vector2;
    public anchorPoint: Vector2;
    constructor( props: TransformProps = {}) {
        this.position = props.position ?? new Vector2(0, 0);
        this.rotation = props.rotation ?? 0;
        this.scale = props.scale ?? new Vector2(1, 1);
        this.size = props.size ?? new Vector2(1, 1);
        this.anchorPoint = props.anchorPoint ?? new Vector2(0.5, 0.5);
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

    relative = {
        position: (position: Vector2) => {
            this.position = this.position.add(position);
        },
        rotation: (rotation: number) => {
            this.rotation += rotation;
        },
        scale: (scale: Vector2) => {
            this.scale = this.scale.multiply(scale);
        }
    }
}