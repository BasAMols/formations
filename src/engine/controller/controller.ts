import type { Actor } from "../core/actor.js";

export abstract class Controller {
    abstract readonly type: string;
    order: number = 0;
    static readonly allowMultiple: boolean = true;
    onAttach?(actor: Actor): void;
    onDetach?(actor: Actor): void;
}
