import { Soldier, type SoldierType } from './soldier.js';

export interface CenturionType extends SoldierType {

}

export class Centurion extends Soldier implements CenturionType {
    
}
