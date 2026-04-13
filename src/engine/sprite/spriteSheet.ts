import { assetLoader } from "../asset/assetLoader.js";
import type { SourceRect, SpriteFrame, AnimationDef } from "./spriteData.js";

// --- Config types for the factory methods ---

export interface GridAnimationConfig {
    row: number;
    startCol: number;
    frameCount: number;
    frameDuration: number;
    loop?: boolean;
}

export interface GridConfig {
    cellWidth: number;
    cellHeight: number;
    animations: Record<string, GridAnimationConfig>;
}

export interface RectsAnimationConfig {
    frameNames: string[];
    frameDuration: number;
    loop?: boolean;
}

export interface RectsConfig {
    frames: Record<string, SourceRect>;
    animations: Record<string, RectsAnimationConfig>;
}

// --- JSON manifest shape ---

interface GridManifest {
    image: string;
    format: "grid";
    cellWidth: number;
    cellHeight: number;
    animations: Record<string, GridAnimationConfig>;
}

interface RectsManifest {
    image: string;
    format: "rects";
    frames: Record<string, SourceRect>;
    animations: Record<string, RectsAnimationConfig>;
}

type SpriteManifest = GridManifest | RectsManifest;

// --- SpriteSheet ---

export class SpriteSheet {
    readonly frames: Map<string, SpriteFrame>;
    readonly animations: Map<string, AnimationDef>;

    private constructor(frames: Map<string, SpriteFrame>, animations: Map<string, AnimationDef>) {
        this.frames = frames;
        this.animations = animations;
    }

    getFrame(name: string): SpriteFrame {
        const f = this.frames.get(name);
        if (!f) throw new Error(`SpriteSheet: frame "${name}" not found`);
        return f;
    }

    getAnimation(name: string): AnimationDef {
        const a = this.animations.get(name);
        if (!a) throw new Error(`SpriteSheet: animation "${name}" not found`);
        return a;
    }

    static fromGrid(image: HTMLImageElement, config: GridConfig): SpriteSheet {
        const frames = new Map<string, SpriteFrame>();
        const animations = new Map<string, AnimationDef>();

        for (const [name, anim] of Object.entries(config.animations)) {
            const animFrames: SpriteFrame[] = [];
            for (let i = 0; i < anim.frameCount; i++) {
                const col = anim.startCol + i;
                const frame: SpriteFrame = {
                    image,
                    source: {
                        x: col * config.cellWidth,
                        y: anim.row * config.cellHeight,
                        w: config.cellWidth,
                        h: config.cellHeight,
                    },
                };
                const frameName = `${name}_${i}`;
                frames.set(frameName, frame);
                animFrames.push(frame);
            }
            animations.set(name, {
                frames: animFrames,
                frameDuration: anim.frameDuration,
                loop: anim.loop,
            });
        }

        return new SpriteSheet(frames, animations);
    }

    static fromRects(image: HTMLImageElement, config: RectsConfig): SpriteSheet {
        const frames = new Map<string, SpriteFrame>();
        const animations = new Map<string, AnimationDef>();

        for (const [name, rect] of Object.entries(config.frames)) {
            frames.set(name, { image, source: rect });
        }

        for (const [name, anim] of Object.entries(config.animations)) {
            const animFrames = anim.frameNames.map(fn => {
                const f = frames.get(fn);
                if (!f) throw new Error(`SpriteSheet.fromRects: frame "${fn}" not found`);
                return f;
            });
            animations.set(name, {
                frames: animFrames,
                frameDuration: anim.frameDuration,
                loop: anim.loop,
            });
        }

        return new SpriteSheet(frames, animations);
    }

    static async fromManifest(url: string): Promise<SpriteSheet> {
        const res = await fetch(url);
        const manifest: SpriteManifest = await res.json();
        const image = await assetLoader.load(manifest.image);

        if (manifest.format === "grid") {
            return SpriteSheet.fromGrid(image, {
                cellWidth: manifest.cellWidth,
                cellHeight: manifest.cellHeight,
                animations: manifest.animations,
            });
        } else {
            return SpriteSheet.fromRects(image, {
                frames: manifest.frames,
                animations: manifest.animations,
            });
        }
    }

    static async fromFiles(
        urls: string[],
        animationName: string,
        frameDuration: number,
        loop?: boolean,
    ): Promise<SpriteSheet> {
        const images = await assetLoader.preload(urls);
        const frames = new Map<string, SpriteFrame>();
        const animFrames: SpriteFrame[] = [];

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const frame: SpriteFrame = {
                image: img,
                source: { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight },
            };
            frames.set(`${animationName}_${i}`, frame);
            animFrames.push(frame);
        }

        const animations = new Map<string, AnimationDef>();
        animations.set(animationName, { frames: animFrames, frameDuration, loop });

        return new SpriteSheet(frames, animations);
    }
}
