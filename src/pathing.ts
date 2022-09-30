import { Vector, Vector3 } from 'three';
import {getObjects, getStart, getGoal} from './main';
import {pointInCircle, pointInCircleList, hitInfo, rayCircleIntersect, rayCircleListIntersect} from './collision';

export default class Pathing {
    private path: THREE.Vector3[];
    private objects: THREE.Object3D[];
    private start: THREE.Vector3;
    private goal: THREE.Vector3;
    private neighbors: number[][];
    private visited: boolean[]; //A list which store if a given node has been visited
    private parent: number[];

    constructor(){
        this.path = [];
        this.objects = [];
        this.start = new Vector3();
        this.goal = new Vector3();
        this.neighbors = [];
        this.visited = [];
        this.parent = [];
    }

    public getPath(){
        // this.planPath(this.start, this.goal, this.getCenters(), this.getRadii(), this.objects.length, this.getCenters(), this.objects.length);
        this.calculatePath();
        return this.path;
    }

    private getCenters(): Vector3[]{
        let centers: Vector3[] = []
        for(let obj of this.objects){
            centers.push(obj.position);
        }
        return centers;
    }

    private getRadii(): number[]{
        let radii: number[] = [];
        for(let i of this.objects){
            //Radii is hardcoded. Need to find a way to get radius of FBX models.
            radii.push(.4);
        }
        return radii;
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

    private connectNeighbors(centers: Vector3[], radii: number[], numObstacles: number, nodePos: Vector3[], numNodes: number){
        for (let i = 0; i < numNodes; i++){
            this.neighbors[i] = [];  //Clear neighbors list
            for (let j = 0; j < numNodes; j++){
            if (i == j) continue; //don't connect to myself 
            const dir = nodePos[j].sub(nodePos[i]).normalize();
            const distBetween = nodePos[i].distanceTo(nodePos[j]);
            const circleListCheck = rayCircleListIntersect(centers, radii, numObstacles, nodePos[i], dir, distBetween);
            if (!circleListCheck.hit){
                this.neighbors[i].push(j);
            }
            }
        }
    }

    private closestNode(point: Vector3, nodePos: Vector3[], numNodes: number, 
        centers: Vector3[], radii: number[], numObstacles: number): number {
        let closestID = -1;
        let minDist = 999999;
        for (let i = 0; i < numNodes; i++){
      
          const queryNode = nodePos[i];
      
          // Make sure the point can see node in question
          if (!this.canSeeEachOther(centers, radii, numObstacles, queryNode, point)) continue;
      
          const dist = queryNode.distanceTo(point);
          if (dist < minDist){
            closestID = i;
            minDist = dist;
          }
        }
        return closestID;
    }

    private canSeeEachOther(centers: Vector3[], radii: number[], numObstacles: number, goal: Vector3, start: Vector3): boolean {
        const dir = goal.sub(start).normalize();
        const distBetween = goal.distanceTo(start);
        const circleListCheck = rayCircleListIntersect(centers, radii, numObstacles, start, dir, distBetween);
        return !circleListCheck.hit;
    }

    private planPath(startPos: Vector3, goalPos: Vector3, centers: Vector3[], radii: number[], numObstacles: number, nodePos: Vector3[], numNodes: number): number[]{
        let path: number[] = [];
      
        // Degenerate case: no obstacles between start and goal
        if (this.canSeeEachOther(centers, radii, numObstacles, goalPos, startPos)) return path;
        
        const startID = this.closestNode(startPos, nodePos, numNodes, centers, radii, numObstacles);
        const goalID = this.closestNode(goalPos, nodePos, numNodes, centers, radii, numObstacles);
      
        // Bad input case: no good start or end node
        if (startID == -1 || goalID == -1) {
          path.push(-1);
          return path;
        }
        
        path = this.runBFS(nodePos, numNodes, startID, goalID);
        
        return path;
    }

    private runUCS(nodePos: Vector3[], numNodes: number, startID: number, goalID: number): number[]{

        return [];
    }

    private runBFS(nodePos: Vector3[], numNodes: number, startID: number, goalID: number): number[]{
        const fringe: number[] = [];  //New empty fringe
        const path: number[] = [];
        for (let i = 0; i < numNodes; i++) { //Clear visit tags and parent pointers
          this.visited[i] = false;
          this.parent[i] = -1; //No parent yet
        }
      
        //println("\nBeginning Search");
        
        this.visited[startID] = true;
        fringe.push(startID);
        //println("Adding node", startID, "(start) to the fringe.");
        //println(" Current Fringe: ", fringe);
        
        while (fringe.length > 0){
          const currentNode = fringe.shift();
          
          if (currentNode == goalID){
            //println("Goal found!");
            break;
          }
          for (let i = 0; i < this.neighbors[currentNode ?? 0].length; i++){
            const neighborNode = this.neighbors[currentNode ?? 0][i];
            if (!this.visited[neighborNode]){
              this.visited[neighborNode] = true;
              this.parent[neighborNode] = currentNode ?? 0;
              fringe.push(neighborNode);
              //println("Added node", neighborNode, "to the fringe.");
              //println(" Current Fringe: ", fringe);
            }
          } 
        }
        
        if (fringe.length == 0){
          //println("No Path");
          path.push(0,-1);
          return path;
        }
          
        //print("\nReverse path: ");
        let prevNode = this.parent[goalID];
        path.push(0,goalID);
        //print(goalID, " ");
        while (prevNode >= 0){
          //print(prevNode," ");
          path.unshift(prevNode);
          prevNode = this.parent[prevNode];
        }
        //print("\n");
      
        console.log("path", path);

        return path;
      }
      
}