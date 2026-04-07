import { Actor } from "../element.js";

export class Dom<T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> extends Actor {
    protected _domElement: HTMLElementTagNameMap[T];
    public get domElement(): HTMLElementTagNameMap[T] {
        return this._domElement;
    }
    protected children: Dom[] = [];
    constructor(tag: T) {
        super();
        this._domElement = document.createElement(tag);
    }
    setStyle(style: Partial<CSSStyleDeclaration>) {
        Object.assign(this._domElement.style, style);
    }
    append<U extends keyof HTMLElementTagNameMap>(element: Dom<U>) {
        this._domElement.appendChild(element._domElement);
        return element;
    }
    child<U extends keyof HTMLElementTagNameMap>(tag: U = 'div' as U) {
        const element = new Dom(tag);
        this.append(element);
        return element;
    }
}