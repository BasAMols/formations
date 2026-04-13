import type { AnimationDef, SpriteFrame } from "./spriteData.js";

export class SpriteAnimation {
    private def: AnimationDef;
    private startTime: number = 0;
    private pauseOffset: number = 0;

    playing: boolean = false;
    finished: boolean = false;

    constructor(def: AnimationDef) {
        this.def = def;
    }

    get loop(): boolean {
        return this.def.loop !== false;
    }

    get frameCount(): number {
        return this.def.frames.length;
    }

    play(): void {
        if (this.finished) this.reset();
        if (this.playing) return;
        this.playing = true;
        this.startTime = performance.now() - this.pauseOffset;
    }

    pause(): void {
        if (!this.playing) return;
        this.playing = false;
        this.pauseOffset = performance.now() - this.startTime;
    }

    reset(): void {
        this.startTime = performance.now();
        this.pauseOffset = 0;
        this.finished = false;
    }

    stop(): void {
        this.playing = false;
        this.finished = false;
        this.pauseOffset = 0;
    }

    setAnimation(def: AnimationDef): void {
        this.def = def;
        this.reset();
        this.playing = true;
        this.startTime = performance.now();
    }

    currentFrame(): SpriteFrame {
        const frames = this.def.frames;
        if (frames.length === 0) {
            throw new Error("SpriteAnimation: no frames");
        }
        if (!this.playing) {
            const idx = Math.min(
                Math.floor(this.pauseOffset / this.def.frameDuration),
                frames.length - 1,
            );
            return frames[Math.max(0, idx)];
        }

        const elapsed = performance.now() - this.startTime;
        const totalDuration = frames.length * this.def.frameDuration;

        if (this.loop) {
            const idx = Math.floor((elapsed % totalDuration) / this.def.frameDuration);
            return frames[idx];
        }

        if (elapsed >= totalDuration) {
            this.finished = true;
            this.playing = false;
            return frames[frames.length - 1];
        }

        const idx = Math.floor(elapsed / this.def.frameDuration);
        return frames[idx];
    }
}
