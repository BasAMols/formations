import type { Actor } from "../core/actor.js";

interface RenderSnapshot {
    actor: Actor;
    prevX: number;
    prevY: number;
    prevAngle: number;
    currX: number;
    currY: number;
    currAngle: number;
    layer: number;
    treeOrder: number;
}

export interface InterpolatedEntry {
    actor: Actor;
    x: number;
    y: number;
    angle: number;
    layer: number;
    treeOrder: number;
}

export class RenderManager {
    private _snapshots: RenderSnapshot[] = [];
    private _actorMap = new Map<Actor, RenderSnapshot>();

    snapshot(root: Actor): void {
        const prev = this._actorMap;
        const entries: RenderSnapshot[] = [];
        const map = new Map<Actor, RenderSnapshot>();
        const order = { v: 0 };

        this._walk(root, entries, map, prev, order);

        this._snapshots = entries;
        this._actorMap = map;
    }

    interpolate(alpha: number): InterpolatedEntry[] {
        const out: InterpolatedEntry[] = new Array(this._snapshots.length);
        for (let i = 0; i < this._snapshots.length; i++) {
            const s = this._snapshots[i];
            out[i] = {
                actor: s.actor,
                x: s.prevX + (s.currX - s.prevX) * alpha,
                y: s.prevY + (s.currY - s.prevY) * alpha,
                angle: s.prevAngle + (s.currAngle - s.prevAngle) * alpha,
                layer: s.layer,
                treeOrder: s.treeOrder,
            };
        }
        return out;
    }

    private _walk(
        actor: Actor,
        entries: RenderSnapshot[],
        map: Map<Actor, RenderSnapshot>,
        prev: Map<Actor, RenderSnapshot>,
        order: { v: number },
    ): void {
        if (!actor.alive) return;

        const hasRender = actor.getControllers('render').length > 0;
        if (hasRender) {
            const wt = actor.worldTransform;
            const px = wt.p.x;
            const py = wt.p.y;
            const pa = wt.q.getAngle();

            const existing = prev.get(actor);
            const entry: RenderSnapshot = {
                actor,
                prevX: existing?.currX ?? px,
                prevY: existing?.currY ?? py,
                prevAngle: existing?.currAngle ?? pa,
                currX: px,
                currY: py,
                currAngle: pa,
                layer: actor.layer,
                treeOrder: order.v++,
            };
            entries.push(entry);
            map.set(actor, entry);
        }

        for (const child of actor.children) {
            this._walk(child, entries, map, prev, order);
        }
    }
}
