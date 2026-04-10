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
