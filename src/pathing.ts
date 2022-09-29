import { Vector3 } from 'three';
import {getObjects, getStart, getGoal} from './main';

export default class Pathing {
    private path: THREE.Vector3[];
    private objects: THREE.Object3D[];
    private start: THREE.Vector3;
    private goal: THREE.Vector3;

    constructor(){
        this.path = [];
        this.objects = [];
        this.start = new Vector3();
        this.goal = new Vector3();
    }

    public getPath(){
        this.calculatePath();
        return this.path;
    }

    private calculatePath(){
        this.objects = getObjects(); //Here's the scene objects.
        this.start = getStart(); //Vector3 of start position. Use x and z coordinates for 2d. (y coord is up)
        this.goal = getGoal();

        //do your math stuff here.

        //Push graph nodes into this. Dummy data for now to test.
        this.path = [new Vector3(8, 0, 8), new Vector3(-8, 0, 8), new Vector3(-8, 0, -8), new Vector3(8, 0, -8)]; 
        return;
    }
}