import { Vec2, World, Circle, Box, AABB, Settings } from "planck";
import type { Contact, ContactImpulse } from "planck";
import { LogicController } from "../controller/logicController.js";
import type { Actor } from "../core/actor.ts";
import { NavGrid } from "./navGrid.js";
import { PhysicsController } from "./physicsController.js";
import { StaticPhysicsController } from "./staticPhysicsController.js";
import { perp } from "../util/math/vecUtil.js";

const PHYSICS_TIMESTEP = 1 / 30;
const REPATH_IMPULSE_THRESHOLD = 200;
const AVOIDANCE_FORCE = 50;
const DEADLOCK_VELOCITY_THRESHOLD = 2.0;

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
        Settings.lengthUnitsPerMeter = 100;
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

    queryPoint(point: Vec2): Actor[] {
        const aabb = new AABB(
            new Vec2(point.x - 0.1, point.y - 0.1),
            new Vec2(point.x + 0.1, point.y + 0.1),
        );
        const found: Actor[] = [];
        this.world.queryAABB(aabb, (fixture) => {
            if (fixture.testPoint(point)) {
                const pc = fixture.getBody().getUserData() as PhysicsController | StaticPhysicsController | null;
                if (pc?.actor) found.push(pc.actor);
            }
            return true;
        });
        return found;
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
            body.setUserData(sc);

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
