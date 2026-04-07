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
    multiply(...other: Vector2[]) {
        return new Vector2(this.x * other.reduce((acc, curr) => acc * curr.x, 1), this.y * other.reduce((acc, curr) => acc * curr.y, 1));
    }
    _safeDivide(a: number, b: number) {
        if (b === 0) {
            return 0;
        }
        return a / b;
    }
    divide(...other: Vector2[]) {
        return new Vector2(this.x / other.reduce((acc, curr) => this._safeDivide(acc, curr.x), 1), this.y / other.reduce((acc, curr) => this._safeDivide(acc, curr.y), 1));
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
