import { Vec2 } from "planck";
import { RenderController } from "../../../engine/controller/renderController.js";
import type { Canvas } from "../../../engine/util/dom/canvas.js";
import type { Actor } from "../../../engine/core/actor.js";
import type { AnimationDef } from "../../../engine/sprite/spriteData.js";
import { SpriteAnimation } from "../../../engine/sprite/spriteAnimation.js";
import { SpriteSheet } from "../../../engine/sprite/spriteSheet.js";

const FRAME_COUNT = 8;
const FRAME_DURATION = 80;
const BODY_BASE_URL = "assets/soldiers_color1/soldier1/rifle/rifle";
const SHADOW_BASE_URL = "assets/Shadows/rifle";

export class SoldierRenderer extends RenderController {
    width: number;
    height: number;

    private bodyAnim: SpriteAnimation | null = null;
    private shadowAnim: SpriteAnimation | null = null;
    private loaded = false;

    constructor(width: number, height: number, private shadowOffset: Vec2 = new Vec2(0, 0)) {
        super();
        this.width = width;
        this.height = height;
    }

    onAttach(): void {
        this.load();
    }

    private load(): Promise<void> {
        const bodyUrls = Array.from({ length: FRAME_COUNT }, (_, i) => `${BODY_BASE_URL}${i + 1}.png`);
        const shadowUrls = Array.from({ length: FRAME_COUNT }, (_, i) => `${SHADOW_BASE_URL}${i + 1}.png`);

        return Promise.all([
            SpriteSheet.fromFiles(bodyUrls, "walk", FRAME_DURATION),
            SpriteSheet.fromFiles(shadowUrls, "walk_shadow", FRAME_DURATION),
        ]).then(([bodySheet, shadowSheet]) => {
            this.bodyAnim = new SpriteAnimation(bodySheet.getAnimation("walk"));
            this.shadowAnim = new SpriteAnimation(shadowSheet.getAnimation("walk_shadow"));
            this.bodyAnim.play();
            this.shadowAnim.play();
            this.loaded = true;
        });
    }

    static fromSheets(bodyDef: AnimationDef, shadowDef: AnimationDef, width: number, height: number): SoldierRenderer {
        const r = new SoldierRenderer(width, height);
        r.bodyAnim = new SpriteAnimation(bodyDef);
        r.shadowAnim = new SpriteAnimation(shadowDef);
        r.bodyAnim.play();
        r.shadowAnim.play();
        r.loaded = true;
        return r;
    }

    render(actor: Actor, canvas: Canvas): void {
        if (!this.loaded) return;

        const dx = -this.width / 2;
        const dy = -this.height / 2;
        const pos = new Vec2(dx, dy);
        const size = new Vec2(this.width, this.height);

        if (this.shadowAnim) {
            const frame = this.shadowAnim.currentFrame();
            const a = -actor.angle;
            const localOffset = new Vec2(
                this.shadowOffset.x * Math.cos(a) - this.shadowOffset.y * Math.sin(a),
                this.shadowOffset.x * Math.sin(a) + this.shadowOffset.y * Math.cos(a),
            );
            canvas.draw.sprite(frame.image, frame.source, Vec2.add(pos, localOffset), size);
        }

        if (this.bodyAnim) {
            const frame = this.bodyAnim.currentFrame();
            canvas.draw.sprite(frame.image, frame.source, pos, size);
        }
    }
}
