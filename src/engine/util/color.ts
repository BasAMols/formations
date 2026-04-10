export class RenderColor {
    public r: number;
    public g: number;
    public b: number;
    public a: number;
    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static black() {
        return new RenderColor(0, 0, 0, 1);
    }
    static white() {
        return new RenderColor(1, 1, 1, 1);
    }
    static red() {
        return new RenderColor(1, 0, 0, 1);
    }
    static green() {
        return new RenderColor(0, 1, 0, 1);
    }
    static blue() {
        return new RenderColor(0, 0, 1, 1);
    }
    static cyan() {
        return new RenderColor(0, 1, 1, 1);
    }
    static magenta() {
        return new RenderColor(1, 0, 1, 1);
    }
    static yellow() {
        return new RenderColor(1, 1, 0, 1);
    }
    static gray(brightness: number = 0.3) {
        return new RenderColor(brightness, brightness, brightness, 1);
    }
    toString() {
        return `rgba(${this.r * 255}, ${this.g * 255}, ${this.b * 255}, ${this.a})`;
    }
}
