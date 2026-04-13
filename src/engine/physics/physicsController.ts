import { Vec2 } from "planck";
import type { Body } from "planck";
import { Controller } from "../controller/controller.js";
import type { Actor } from "../core/actor.js";
import type { NavGrid } from "./navGrid.js";

const WAYPOINT_THRESHOLD = 15;
const SETTLED_VELOCITY_THRESHOLD = 1.0;
const MIN_SMART_DIST = 40;
const DEST_MATCH_DIST = 50;

export class PhysicsController extends Controller {
    readonly type = 'physics';
    static readonly allowMultiple = false;

    public actor: Actor | null = null;
    private _body: Body | null = null;
    private _navGrid: NavGrid | null = null;
    private _waypoints: Vec2[] = [];
    private _waypointIndex: number = 0;
    private _destination: Vec2 | null = null;
    private _awaitingRepath: boolean = false;

    constructor(public radius: number, public density: number = 1, public linearDamping: number = 0, public filterGroupIndex: number = 0) {
        super();
    }

    onAttach(actor: Actor): void { this.actor = actor; }
    onDetach(): void { this.actor = null; }

    setVelocity(v: Vec2): void { this._body?.setLinearVelocity(v); }
    getVelocity(): Vec2 { return this._body?.getLinearVelocity() ?? Vec2.zero(); }
    getPosition(): Vec2 { return this._body?.getPosition() ?? Vec2.zero(); }

    impulse(v: Vec2): void {
        if (!this._body) return;
        const cur = this._body.getLinearVelocity();
        this._body.setLinearVelocity(Vec2.add(cur, v));
        if (this.hasPath || this._awaitingRepath) {
            this._cancelForImpulse();
        }
    }

    get hasPath(): boolean { return this._awaitingRepath || this._waypointIndex < this._waypoints.length; }

    moveTo(target: Vec2): boolean {
        if (!this._navGrid) return false;
        const path = this._navGrid.findPath(this.getPosition(), target);
        if (path.length === 0) return false;
        this._waypoints = path;
        this._waypointIndex = 0;
        this._destination = Vec2.clone(target);
        this._awaitingRepath = false;
        return true;
    }

    clearPath(): void {
        this._waypoints = [];
        this._waypointIndex = 0;
        this._destination = null;
        this._awaitingRepath = false;
    }

    tick(maxSpeed: number, accel: number): void {
        if (this._awaitingRepath) {
            const vel = this.getVelocity();
            if (vel.length() <= SETTLED_VELOCITY_THRESHOLD) {
                this._awaitingRepath = false;
                this._repath();
            } else {
                this.setVelocity(Vec2.mul(vel, 1 - accel));
            }
            return;
        }

        if (!this.hasPath) {
            const vel = this.getVelocity();
            if (vel.length() > 0.5) {
                this.setVelocity(Vec2.mul(vel, 1 - accel));
            } else {
                this.setVelocity(Vec2.zero());
            }
            return;
        }

        const target = this._waypoints[this._waypointIndex];
        const pos = this.getPosition();
        const delta = Vec2.sub(target, pos);
        const dist = delta.length();

        if (dist < WAYPOINT_THRESHOLD) {
            this._waypointIndex++;
            this.tick(maxSpeed, accel);
            return;
        }

        const dir = Vec2.mul(delta, 1 / dist);
        const desiredVel = Vec2.mul(dir, maxSpeed);
        const currentVel = this.getVelocity();
        const newVel = Vec2.add(
            Vec2.mul(currentVel, 1 - accel),
            Vec2.mul(desiredVel, accel),
        );
        this.setVelocity(newVel);
    }

    moveToDirect(target: Vec2, maxSpeed: number, accel: number): void {
        this.clearPath();
        const pos = this.getPosition();
        const delta = Vec2.sub(target, pos);
        const dist = delta.length();
        if (dist < 0.5) {
            const vel = this.getVelocity();
            if (vel.length() > 0.5) this.setVelocity(Vec2.mul(vel, 1 - accel));
            else this.setVelocity(Vec2.zero());
            return;
        }
        const dir = Vec2.mul(delta, 1 / dist);
        const desiredVel = Vec2.mul(dir, maxSpeed);
        const currentVel = this.getVelocity();
        this.setVelocity(Vec2.add(
            Vec2.mul(currentVel, 1 - accel),
            Vec2.mul(desiredVel, accel),
        ));
    }

    isInContact(): boolean {
        if (!this._body) return false;
        for (let ce = this._body.getContactList(); ce; ce = ce.next) {
            if (ce.contact.isTouching()) return true;
        }
        return false;
    }

    isWalkable(pos: Vec2): boolean {
        return this._navGrid?.isWalkable(pos) ?? true;
    }

    findNearestWalkable(pos: Vec2, condition?: (p: Vec2) => boolean, maxSamples?: number, step?: number): Vec2 | null {
        return this._navGrid?.findNearestWalkable(pos, condition, maxSamples, step) ?? null;
    }

    hasLineOfSight(target: Vec2, from?: Vec2): boolean {
        if (!this._body) return true;
        const world = this._body.getWorld();
        const pos = from ?? this.getPosition();
        const delta = Vec2.sub(target, pos);
        const dist = delta.length();
        if (dist < 0.5) return true;

        if (from) {
            let blocked = false;
            world.rayCast(pos, target, (fixture) => {
                if (fixture.getBody().getType() === 'static') {
                    blocked = true;
                    return 0;
                }
                return -1;
            });
            return !blocked;
        }

        const dir = Vec2.mul(delta, 1 / dist);
        const perpX = -dir.y * this.radius;
        const perpY =  dir.x * this.radius;

        const rays: [Vec2, Vec2][] = [
            [pos, target],
            [new Vec2(pos.x + perpX, pos.y + perpY), new Vec2(target.x + perpX, target.y + perpY)],
            [new Vec2(pos.x - perpX, pos.y - perpY), new Vec2(target.x - perpX, target.y - perpY)],
        ];

        for (const [rayFrom, rayTo] of rays) {
            let blocked = false;
            world.rayCast(rayFrom, rayTo, (fixture) => {
                if (fixture.getBody().getType() === 'static') {
                    blocked = true;
                    return 0;
                }
                return -1;
            });
            if (blocked) return false;
        }
        return true;
    }

    moveToSmart(target: Vec2, maxSpeed: number, accel: number, snapCondition?: (p: Vec2) => boolean, maxSamples?: number, step?: number): boolean {
        if (this.hasPath && this._destination) {
            if (Vec2.sub(this._destination, target).length() < DEST_MATCH_DIST) {
                this.tick(maxSpeed, accel);
                return true;
            }
        }

        const snapped = this.isWalkable(target) && (!snapCondition || snapCondition(target))
            ? target
            : this.findNearestWalkable(target, snapCondition, maxSamples, step);

        if (!snapped) return false;

        const dist = Vec2.sub(snapped, this.getPosition()).length();

        if (dist < MIN_SMART_DIST) {
            this.moveToDirect(snapped, maxSpeed, accel);
            return true;
        }

        if (this.hasLineOfSight(snapped)) {
            this.moveToDirect(snapped, maxSpeed, accel);
            return true;
        }

        this.moveTo(snapped);

        if (this.hasPath) {
            this.tick(maxSpeed, accel);
        } else {
            this.moveToDirect(snapped, maxSpeed, accel);
        }
        return true;
    }

    /** @internal */
    _setNavGrid(grid: NavGrid | null): void { this._navGrid = grid; }

    /** @internal */
    _setBody(body: Body | null): void { this._body = body; }

    /** @internal Called by PhysicsManagerController on significant collision */
    _onCollisionImpulse(): void {
        if (this.hasPath || this._awaitingRepath) {
            this._cancelForImpulse();
        }
    }

    private _cancelForImpulse(): void {
        this._waypoints = [];
        this._waypointIndex = 0;
        this._awaitingRepath = true;
    }

    private _repath(): void {
        if (!this._destination || !this._navGrid) return;
        const path = this._navGrid.findPath(this.getPosition(), this._destination);
        if (path.length === 0) {
            this._destination = null;
            return;
        }
        this._waypoints = path;
        this._waypointIndex = 0;
    }
}
