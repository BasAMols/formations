import type { Actor } from "../core/actor.js";
import { Controller } from "./controller.js";

export abstract class LogicController extends Controller {
    readonly type = 'logic';
    abstract tick(actor: Actor): void;
}
