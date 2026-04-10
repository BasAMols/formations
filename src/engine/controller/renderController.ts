import type { Actor } from "../core/actor.js";
import type { Canvas } from "../util/dom/canvas.js";
import { Controller } from "./controller.js";

export abstract class RenderController extends Controller {
    readonly type = 'render';
    abstract render(actor: Actor, canvas: Canvas): void;
}
