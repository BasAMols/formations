import { Soldier, type SoldierType } from '../individuals/soldier.js';


export interface DecurionType extends SoldierType {

}
export class Decurion extends Soldier implements DecurionType {
}
