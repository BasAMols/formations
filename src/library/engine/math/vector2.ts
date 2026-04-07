export class Vector2 {
    public x: number;
    public y: number;
    constructor(x: number = 0, y: number = x) {
        this.x = x;
        this.y = y;
    }
    add(...other: Vector2[]) {
        return new Vector2(this.x + other.reduce((acc, curr) => acc + curr.x, 0), this.y + other.reduce((acc, curr) => acc + curr.y, 0));
    }
    subtract(...other: Vector2[]) {
        return new Vector2(this.x - other.reduce((acc, curr) => acc + curr.x, 0), this.y - other.reduce((acc, curr) => acc + curr.y, 0));
    }
    private _mul(acc: Vector2, b: Vector2|number): Vector2 {
        if (b instanceof Vector2) {
            return new Vector2(acc.x * b.x, acc.y * b.y);
        }
        return new Vector2(acc.x * b, acc.y * b);
    }
    multiply(...other: (Vector2|number)[]) {
        return other.reduce<Vector2>((acc, curr) => this._mul(acc, curr), this);
    }
    private _d(a: number, b: number) {
        if (b === 0) {
            return 0;
        }
        return a / b;
    }
    divide(...other: Vector2[]) {
        return new Vector2(this.x / other.reduce((acc, curr) => this._d(acc, curr.x), 1), this.y / other.reduce((acc, curr) => this._d(acc, curr.y), 1));
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        return this.divide(new Vector2(this.magnitude(), this.magnitude()));
    }
    distance(other: Vector2) {
        return this.subtract(other).magnitude();
    }


    clampAxis(min: number|Vector2 = 0, max: number|Vector2 = Infinity) {
        const minX = min instanceof Vector2 ? min.x : min;
        const minY = min instanceof Vector2 ? min.y : min;
        const maxX = max instanceof Vector2 ? max.x : max;
        const maxY = max instanceof Vector2 ? max.y : max;
        return new Vector2(Math.min(Math.max(this.x, minX), maxX), Math.min(Math.max(this.y, minY), maxY));
    }
    clampMagnitude(min: number, max: number) {
        const mag = this.magnitude();
        if (mag < min) return this.multiply(min / mag);
        if (mag > max) return this.multiply(max / mag);
        return this;
    }

    static distance(a: Vector2, b: Vector2) {
        return a.distance(b);
    }
    static zero() {
        return new Vector2(0, 0);
    }
    static up() {
        return new Vector2(0, 1);
    }
    static down() {
        return new Vector2(0, -1);
    }
    static left() {
        return new Vector2(-1, 0);
    }
    static right() {
        return new Vector2(1, 0);
    }
}
