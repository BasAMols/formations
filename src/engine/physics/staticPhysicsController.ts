import type { Body } from "planck";
import { Controller } from "../controller/controller.js";
import type { Actor } from "../core/actor.js";

export class StaticPhysicsController extends Controller {
    readonly type = 'static-physics';
    static readonly allowMultiple = false;

    public actor: Actor | null = null;
    private _body: Body | null = null;

    constructor(public width: number, public height: number) {
        super();
    }

    onAttach(actor: Actor): void { this.actor = actor; }
    onDetach(): void { this.actor = null; }

    /** @internal */
    _setBody(body: Body | null): void { this._body = body; }
}
