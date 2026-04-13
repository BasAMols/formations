import { Vec2 } from "planck";
import { RenderController } from "../controller/renderController.js";
import type { Canvas } from "../util/dom/canvas.js";
import type { Actor } from "../core/actor.js";
import type { SpriteFrame } from "../sprite/spriteData.js";
import type { SpriteAnimation } from "../sprite/spriteAnimation.js";

interface SpriteRendererConfig {
    width: number;
    height: number;
    frame?: SpriteFrame;
    animation?: SpriteAnimation;
    anchor?: Vec2;
    flipX?: boolean;
    flipY?: boolean;
}

export class SpriteRenderer extends RenderController {
    width: number;
    height: number;
    frame: SpriteFrame | undefined;
    animation: SpriteAnimation | undefined;
    anchor: Vec2;
    flipX: boolean;
    flipY: boolean;

    constructor(config: SpriteRendererConfig) {
        super();
        this.width = config.width;
        this.height = config.height;
        this.frame = config.frame;
        this.animation = config.animation;
        this.anchor = config.anchor ?? new Vec2(0.5, 0.5);
        this.flipX = config.flipX ?? false;
        this.flipY = config.flipY ?? false;
    }

    render(_actor: Actor, canvas: Canvas): void {
        const frame = this.animation ? this.animation.currentFrame() : this.frame;
        if (!frame) return;

        const dx = -this.width * this.anchor.x;
        const dy = -this.height * this.anchor.y;

        const needsFlip = this.flipX || this.flipY;
        if (needsFlip) {
            canvas.ctx.save();
            canvas.ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);
        }

        const drawX = this.flipX ? -dx - this.width : dx;
        const drawY = this.flipY ? -dy - this.height : dy;

        canvas.draw.sprite(
            frame.image,
            frame.source,
            new Vec2(drawX, drawY),
            new Vec2(this.width, this.height),
        );

        if (needsFlip) {
            canvas.ctx.restore();
        }
    }
}
