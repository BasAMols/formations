import { Actor } from "../../core/actor.js";

export class Dom<T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> extends Actor {
    protected _domElement: HTMLElementTagNameMap[T];
    public get domElement(): HTMLElementTagNameMap[T] {
        return this._domElement;
    }
    constructor(tag: T) {
        super();
        this._domElement = document.createElement(tag);
    }
    setStyle(style: Partial<CSSStyleDeclaration>) {
        Object.assign(this._domElement.style, style);
    }
    append(element: Dom<keyof HTMLElementTagNameMap> | Actor) {
        if (element instanceof Dom) {
            this._domElement.appendChild(element.domElement);
        }
        super.append(element);
        return element;
    }
}
