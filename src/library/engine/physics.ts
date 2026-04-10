import { Vec2, World, Circle, Box } from "planck";
import type { Body, Contact, ContactImpulse } from "planck";
import { Controller, LogicController } from "./controller.js";
import type { Actor } from "./element.js";
import { NavGrid } from "./navigation.js";
import { perp } from "./math/vecUtil.js";

const PHYSICS_TIMESTEP = 1 / 60;
const WAYPOINT_THRESHOLD = 15;
const SETTLED_VELOCITY_THRESHOLD = 1.0;
const REPATH_IMPULSE_THRESHOLD = 200;
const AVOIDANCE_FORCE = 50;
const DEADLOCK_VELOCITY_THRESHOLD = 2.0;
const MIN_SMART_DIST = 40;
const DEST_MATCH_DIST = 50;

export class PhysicsController extends Controller {
    readonly type = 'physics';
    static readonly allowMultiple = false;

    private _body: Body | null = null;
    private _navGrid: NavGrid | null = null;
    private _waypoints: Vec2[] = [];
    private _waypointIndex: number = 0;
    private _destination: Vec2 | null = null;
    private _awaitingRepath: boolean = false;

    public filterGroupIndex: number = 0;

    constructor(public radius: number, public density: number = 1, public linearDamping: number = 0) {
        super();
    }

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

export class StaticPhysicsController extends Controller {
    readonly type = 'static-physics';
    static readonly allowMultiple = false;

    private _body: Body | null = null;

    constructor(public width: number, public height: number) {
        super();
    }

    /** @internal */
    _setBody(body: Body | null): void { this._body = body; }
}

export interface PhysicsManagerOptions {
    worldWidth: number;
    worldHeight: number;
    cellSize?: number;
    padding?: number;
}

export class PhysicsManagerController extends LogicController {
    order = 0;
    public world: World;
    public navGrid: NavGrid;
    private _trackedDynamic = new Map<Actor, PhysicsController>();
    private _trackedStatic = new Map<Actor, StaticPhysicsController>();
    private _padding: number;
    private _navDirty = true;

    constructor(options: PhysicsManagerOptions) {
        super();
        this.world = new World({ gravity: new Vec2(0, 0) });
        this.navGrid = new NavGrid(options.worldWidth, options.worldHeight, options.cellSize ?? 8);
        this._padding = options.padding ?? 32;

        this.world.on('post-solve', (contact: Contact, impulse: ContactImpulse) => {
            this._handlePostSolve(contact, impulse);
        });
    }

    rebuildNavGrid(root: Actor): void {
        this.navGrid.rebuild(root, this._padding);
        this._navDirty = false;
    }

    tick(actor: Actor): void {
        this.world.step(PHYSICS_TIMESTEP);
        this.sync(actor);

        if (this._navDirty) {
            this.rebuildNavGrid(actor);
        }

        this._resolveDeadlocks();
    }

    private _handlePostSolve(_contact: Contact, impulse: ContactImpulse): void {
        let total = 0;
        for (const n of impulse.normalImpulses) total += Math.abs(n);
        if (total < REPATH_IMPULSE_THRESHOLD) return;

        const bodyA = _contact.getFixtureA().getBody();
        const bodyB = _contact.getFixtureB().getBody();
        const pcA = bodyA.getUserData() as PhysicsController | null;
        const pcB = bodyB.getUserData() as PhysicsController | null;

        if (pcA instanceof PhysicsController) pcA._onCollisionImpulse();
        if (pcB instanceof PhysicsController) pcB._onCollisionImpulse();
    }

    private _resolveDeadlocks(): void {
        const nudged = new Set<PhysicsController>();

        for (let c = this.world.getContactList(); c; c = c.getNext()) {
            if (!c.isTouching()) continue;

            const bodyA = c.getFixtureA().getBody();
            const bodyB = c.getFixtureB().getBody();
            const pcA = bodyA.getUserData();
            const pcB = bodyB.getUserData();

            const wm = c.getWorldManifold(null);
            if (!wm || wm.pointCount === 0) continue;
            const normal = new Vec2(wm.normal.x, wm.normal.y);

            if (pcA instanceof PhysicsController && pcA.hasPath && !nudged.has(pcA)) {
                if (pcA.getVelocity().length() <= DEADLOCK_VELOCITY_THRESHOLD) {
                    const away = Vec2.neg(normal);
                    const slide = Vec2.neg(perp(normal));
                    const dir = Vec2.normalize(Vec2.add(away, slide));
                    const cur = pcA.getVelocity();
                    pcA.setVelocity(Vec2.add(cur, Vec2.mul(dir, AVOIDANCE_FORCE)));
                    nudged.add(pcA);
                }
            }

            if (pcB instanceof PhysicsController && pcB.hasPath && !nudged.has(pcB)) {
                if (pcB.getVelocity().length() <= DEADLOCK_VELOCITY_THRESHOLD) {
                    const away = Vec2.clone(normal);
                    const slide = perp(normal);
                    const dir = Vec2.normalize(Vec2.add(away, slide));
                    const cur = pcB.getVelocity();
                    pcB.setVelocity(Vec2.add(cur, Vec2.mul(dir, AVOIDANCE_FORCE)));
                    nudged.add(pcB);
                }
            }
        }
    }

    private sync(root: Actor): void {
        const dynamics = new Map<Actor, PhysicsController>();
        const statics = new Map<Actor, StaticPhysicsController>();
        this.walk(root.children, dynamics, statics);

        for (const [actor, pc] of dynamics) {
            if (this._trackedDynamic.has(actor)) continue;

            const body = this.world.createBody({
                type: "dynamic",
                position: actor.position,
                fixedRotation: true,
                linearDamping: pc.linearDamping,
            });
            body.createFixture(new Circle(pc.radius), {
                density: pc.density,
                filterGroupIndex: pc.filterGroupIndex,
            });
            body.setUserData(pc);

            pc._setBody(body);
            pc._setNavGrid(this.navGrid);
            actor.body = body;
            actor.relative = false;

            this._trackedDynamic.set(actor, pc);
        }

        for (const [actor, sc] of statics) {
            if (this._trackedStatic.has(actor)) continue;

            const body = this.world.createBody({
                type: "static",
                position: actor.position,
            });
            body.createFixture(new Box(sc.width / 2, sc.height / 2));

            sc._setBody(body);
            actor.body = body;
            actor.relative = false;

            this._trackedStatic.set(actor, sc);
            this._navDirty = true;
        }

        for (const [actor, pc] of this._trackedDynamic) {
            if (!dynamics.has(actor)) {
                if (actor.body) this.world.destroyBody(actor.body);
                pc._setBody(null);
                pc._setNavGrid(null);
                actor.body = null;
                this._trackedDynamic.delete(actor);
            }
        }

        for (const [actor, sc] of this._trackedStatic) {
            if (!statics.has(actor)) {
                if (actor.body) this.world.destroyBody(actor.body);
                sc._setBody(null);
                actor.body = null;
                this._trackedStatic.delete(actor);
                this._navDirty = true;
            }
        }
    }

    private walk(
        actors: Actor[],
        dynamics: Map<Actor, PhysicsController>,
        statics: Map<Actor, StaticPhysicsController>,
    ): void {
        for (const actor of actors) {
            if (!actor.alive) continue;

            const pc = actor.getControllers<PhysicsController>('physics')[0];
            if (pc) dynamics.set(actor, pc);

            const sc = actor.getControllers<StaticPhysicsController>('static-physics')[0];
            if (sc) statics.set(actor, sc);

            this.walk(actor.children, dynamics, statics);
        }
    }
}
