import type { Actor } from "./element.js";
import type { Canvas } from "./dom/canvas.js";

export abstract class Controller {
    abstract readonly type: string;
    order: number = 0;
    static readonly allowMultiple: boolean = true;
    onAttach?(actor: Actor): void;
    onDetach?(actor: Actor): void;
}

export abstract class RenderController extends Controller {
    readonly type = 'render';
    abstract render(actor: Actor, canvas: Canvas): void;
}

export abstract class LogicController extends Controller {
    readonly type = 'logic';
    abstract tick(actor: Actor): void;
}
