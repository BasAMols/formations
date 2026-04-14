import { Vec2 } from "planck";
import { RenderColor } from "../engine/util/color.js";
import { RenderController } from "../engine/controller/renderController.js";
import type { Canvas } from "../engine/util/dom/canvas.js";
import { Game as BaseGame } from "../engine/core/game.js";
import type { Actor } from "../engine/core/actor.js";
import { MainLevel } from "./levels/mainLevel.js";


export class Game extends BaseGame {
    constructor() {
        super();
        this.loadLevel(new MainLevel());
    }

    onClick(screen: Vec2, world: Vec2, actors: Actor[]): void {
        console.log('click', { screen, world, actors });
    }
}
