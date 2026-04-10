import { Transform, Vec2 } from "planck";
import type { Body } from "planck";
import type { Controller } from "../controller/controller.js";
import type { LogicController } from "../controller/logicController.js";

export interface ActorInterface {
    size?: Vec2;
    position?: Vec2;
    angle?: number;
    layer?: number;
    relative?: boolean;
}

export class Actor {
    public children: Actor[] = [];
    protected _alive: boolean = true;
    get alive(): boolean { return this._alive; }

    public body: Body | null = null;
    private _size: Vec2;

    get size(): Vec2 { return this._size; }
    set size(v: Vec2) { this._size = v; }

    private _localTransform: Transform;
    public worldTransform: Transform;
    public layer: number;
    public treeOrder: number = 0;
    public relative: boolean;

    get localTransform(): Transform {
        return this.body ? this.body.getTransform() : this._localTransform;
    }

    get position(): Vec2 {
        return this.localTransform.p;
    }
    set position(v: Vec2) {
        if (this.body) this.body.setPosition(v);
        else this._localTransform.setNum(v, this._localTransform.q.getAngle());
    }

    get angle(): number {
        return this.localTransform.q.getAngle();
    }
    set angle(v: number) {
        if (this.body) this.body.setAngle(v);
        else this._localTransform.setNum(this._localTransform.p, v);
    }

    private _controllers: Controller[] = [];

    constructor(props: ActorInterface = {}) {
        this._localTransform = new Transform(
            props.position ?? Vec2.zero(),
            props.angle ?? 0
        );
        this.worldTransform = new Transform();
        this._size = props.size ?? new Vec2(1, 1);
        this.layer = props.layer ?? 0;
        this.relative = props.relative ?? true;
    }

    addController<T extends Controller>(c: T): T {
        const ctor = c.constructor as typeof Controller;
        if (ctor.allowMultiple === false && this._controllers.some(x => x.type === c.type)) {
            throw new Error(`Type '${c.type}' allows only one controller`);
        }
        this._controllers.push(c);
        c.onAttach?.(this);
        return c;
    }

    removeController(c: Controller): void {
        this._controllers = this._controllers.filter(x => x !== c);
        c.onDetach?.(this);
    }

    getControllers<T extends Controller>(type: string): T[] {
        return this._controllers
            .filter(c => c.type === type)
            .sort((a, b) => a.order - b.order) as T[];
    }

    append(element: Actor) {
        this.children.push(element);
        return element;
    }

    child() {
        const element = new Actor();
        this.append(element);
        return element;
    }

    destroy() {
        this._alive = false;
        for (const c of [...this._controllers]) {
            c.onDetach?.(this);
        }
        this._controllers = [];
        this.children.forEach(child => child.destroy());
    }

    logicTick(parentXf: Transform, renderables: Actor[]): void {
        if (!this._alive) return;
        this.children = this.children.filter(c => c._alive);

        for (const c of this.getControllers<LogicController>('logic')) {
            c.tick(this);
        }

        this.worldTransform = this.relative
            ? Transform.mul(parentXf, this.localTransform)
            : this.localTransform;

        this.treeOrder = renderables.length;
        if (this._controllers.some(c => c.type === 'render')) {
            renderables.push(this);
        }

        for (const child of this.children) {
            child.logicTick(this.worldTransform, renderables);
        }
    }
}
