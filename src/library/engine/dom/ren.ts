import { Canvas } from "./canvas.js";
import { Vector2 } from "../math/vector2.js";
import type { RenderColor } from "../color.js";

export class Renderer {
    private canvas: Canvas;
    constructor(canvas: Canvas) {
        this.canvas = canvas;
    }

    draw = {
        circle: (position: Vector2, radius: number, color: RenderColor) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
            this.canvas.ctx.fillStyle = color.toString();
            this.canvas.ctx.fill();
        },
        rect: (position: Vector2, size: Vector2, color: RenderColor) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.rect(position.x, position.y, size.x, size.y);
            this.canvas.ctx.fillStyle = color.toString();
            this.canvas.ctx.fill();
        },
        line: (start: Vector2, end: Vector2, color: RenderColor) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(start.x, start.y);
            this.canvas.ctx.lineTo(end.x, end.y);
            this.canvas.ctx.strokeStyle = color.toString();
            this.canvas.ctx.stroke();
        },
        text: (text: string, position: Vector2, color: RenderColor) => {
            this.canvas.ctx.fillStyle = color.toString();
            this.canvas.ctx.fillText(text, position.x, position.y);
        }
    }
    clear = {
        all: () => {
            this.canvas.ctx.clearRect(0, 0, this.canvas.size.x, this.canvas.size.y);
        },
        rect: (position: Vector2, size: Vector2) => {
            this.canvas.ctx.clearRect(position.x, position.y, size.x, size.y);
        },
    }
}