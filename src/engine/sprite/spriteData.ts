export interface SourceRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface SpriteFrame {
    image: HTMLImageElement;
    source: SourceRect;
}

export interface AnimationDef {
    frames: SpriteFrame[];
    frameDuration: number;
    loop?: boolean;
}
