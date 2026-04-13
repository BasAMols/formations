import { Vec2 } from "planck";
import type { RenderColor } from "../color.js";
import type { SourceRect } from "../../sprite/spriteData.js";
import type { Canvas } from "./canvas.js";

export class Renderer {
    private canvas: Canvas;
    constructor(canvas: Canvas) {
        this.canvas = canvas;
    }

    draw = {
        circle: (position: Vec2, radius: number, color: RenderColor) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
            this.canvas.ctx.fillStyle = color.toString();
            this.canvas.ctx.fill();
        },
        rect: (position: Vec2, size: Vec2, color: RenderColor) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.rect(position.x, position.y, size.x, size.y);
            this.canvas.ctx.fillStyle = color.toString();
            this.canvas.ctx.fill();
        },
        line: (start: Vec2, end: Vec2, color: RenderColor) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(start.x, start.y);
            this.canvas.ctx.lineTo(end.x, end.y);
            this.canvas.ctx.strokeStyle = color.toString();
            this.canvas.ctx.stroke();
        },
        text: (text: string, position: Vec2, color: RenderColor) => {
            this.canvas.ctx.fillStyle = color.toString();
            this.canvas.ctx.fillText(text, position.x, position.y);
        },
        image: (image: CanvasImageSource, position: Vec2, size: Vec2) => {
            this.canvas.ctx.drawImage(image, position.x, position.y, size.x, size.y);
        },
        sprite: (image: CanvasImageSource, source: SourceRect, position: Vec2, size: Vec2) => {
            this.canvas.ctx.drawImage(
                image,
                source.x, source.y, source.w, source.h,
                position.x, position.y, size.x, size.y,
            );
        },
    }
    clear = {
        all: () => {
            const s = this.canvas.size;
            this.canvas.ctx.clearRect(0, 0, s.x, s.y);
        },
        rect: (position: Vec2, size: Vec2) => {
            this.canvas.ctx.clearRect(position.x, position.y, size.x, size.y);
        },
    }
}
