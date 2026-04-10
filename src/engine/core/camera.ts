import { Vec2 } from "planck";

export class Camera {
    public offset: Vec2 = Vec2.zero();
    public zoom: number = 1;

    constructor(
        public readonly worldWidth: number,
        public readonly worldHeight: number,
    ) {}

    screenToWorld(screen: Vec2, viewportSize: Vec2): Vec2 {
        return new Vec2(
            screen.x / this.zoom + this.offset.x,
            screen.y / this.zoom + this.offset.y,
        );
    }

    worldToScreen(world: Vec2, viewportSize: Vec2): Vec2 {
        return new Vec2(
            (world.x - this.offset.x) * this.zoom,
            (world.y - this.offset.y) * this.zoom,
        );
    }

    pan(screenDelta: Vec2): void {
        this.offset = new Vec2(
            this.offset.x - screenDelta.x / this.zoom,
            this.offset.y - screenDelta.y / this.zoom,
        );
        this.clamp(this._viewportSize);
    }

    zoomAt(screenPos: Vec2, factor: number, viewportSize: Vec2): void {
        this._viewportSize = viewportSize;
        const worldBefore = this.screenToWorld(screenPos, viewportSize);
        this.zoom = Math.max(0.1, Math.min(5, this.zoom * factor));
        const worldAfter = this.screenToWorld(screenPos, viewportSize);
        this.offset = new Vec2(
            this.offset.x + (worldBefore.x - worldAfter.x),
            this.offset.y + (worldBefore.y - worldAfter.y),
        );
        this.clamp(viewportSize);
    }

    centerOn(pos: Vec2, viewportSize: Vec2): void {
        this.offset = new Vec2(
            pos.x - (viewportSize.x / this.zoom) / 2,
            pos.y - (viewportSize.y / this.zoom) / 2,
        );
        this.clamp(viewportSize);
    }

    private _viewportSize: Vec2 = Vec2.zero();

    clamp(viewportSize: Vec2): void {
        this._viewportSize = viewportSize;
        const visibleW = viewportSize.x / this.zoom;
        const visibleH = viewportSize.y / this.zoom;

        const maxX = Math.max(0, this.worldWidth - visibleW);
        const maxY = Math.max(0, this.worldHeight - visibleH);

        this.offset = new Vec2(
            Math.max(0, Math.min(maxX, this.offset.x)),
            Math.max(0, Math.min(maxY, this.offset.y)),
        );
    }
}
