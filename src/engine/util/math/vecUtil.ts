import { Vec2 } from "planck";

export function clampMagnitude(v: Vec2, min: number, max: number): Vec2 {
    const len = v.length();
    if (len === 0) return Vec2.zero();
    if (len < min) return Vec2.mul(Vec2.normalize(v), min);
    if (len > max) return Vec2.mul(Vec2.normalize(v), max);
    return Vec2.clone(v);
}

export function perp(v: Vec2): Vec2 {
    return new Vec2(v.y, -v.x);
}

export function rotateToward(current: number, target: number, maxStep: number): number {
    let diff = target - current;
    diff = diff - Math.round(diff / (2 * Math.PI)) * 2 * Math.PI;
    if (Math.abs(diff) <= maxStep) return target;
    return current + Math.sign(diff) * maxStep;
}
