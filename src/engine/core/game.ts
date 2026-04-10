import { Vec2 } from "planck";
import { Actor } from "./actor.js";
import { Camera } from "./camera.js";
import type { Level } from "./level.js";
import type { PhysicsManagerController } from "../physics/physicsManager.js";

export class Game extends Actor {
    protected _level: Level | null = null;

    get level(): Level | null { return this._level; }

    get camera(): Camera {
        if (!this._level) throw new Error("No level loaded");
        return this._level.camera;
    }

    get physics(): PhysicsManagerController {
        if (!this._level) throw new Error("No level loaded");
        return this._level.physics;
    }

    loadLevel(level: Level): void {
        if (this._level) {
            this._level.destroy();
            this.children = this.children.filter(c => c !== this._level);
        }
        this._level = level;
        this.append(level);
    }

    onClick(screen: Vec2, world: Vec2, actors: Actor[]): void {}
}
