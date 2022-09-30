import { Object3D, Vector, Vector3 } from 'three';
import {getObjects, getStart, getGoal, visuzlizeNodes, visualizeNeighbors} from './main';
import {pointInCircle, pointInCircleList, hitInfo, rayCircleIntersect, rayCircleListIntersect} from './collision';

export default class Pathing {
    private obstacles: Object3D[];
    private nodePos: Vector3[];
    private start: Vector3;
    private goal: Vector3;
    private radius: number;
    private neighbors: number[][];
    private numberOfNodes: number;
    private visited: boolean[];
    private parent: number[];

    constructor(){
        this.numberOfNodes = 200;
        this.radius = .6;
        this.neighbors = new Array(this.numberOfNodes).fill([]);
        this.start = new Vector3();
        this.goal = new Vector3();
        this.obstacles = [];
        
        this.nodePos = [];

        this.visited = [];
        this.parent = [];
    }

    public getPath(): Vector3[]{
      
      this.start = getStart();
      this.goal = getGoal();
      this.obstacles = getObjects();

      // while(true){
        this.generateRandomNodes(this.numberOfNodes, this.getCenters());
        visuzlizeNodes(this.nodePos);

        this.connectNeighbors(this.getCenters(), this.radius, this.obstacles.length, this.nodePos, this.numberOfNodes);
        // visualizeNeighbors(this.nodePos, this.neighbors);

        const startID = this.closestNode(this.start, this.nodePos, this.numberOfNodes, this.getCenters(), this.radius, this.obstacles.length);
        const goalID = this.closestNode(this.goal, this.nodePos, this.numberOfNodes, this.getCenters(), this.radius, this.obstacles.length);
        console.log("start:", startID, "goalid:", goalID)

        const nodeOrder = this.runBFS(this.nodePos, this.numberOfNodes, startID, goalID);
        
        if(nodeOrder.length === 0){
          console.log("case 1");
          return [this.nodePos[startID], this.nodePos[goalID]];
        }

        if(nodeOrder[0] === -1){
          console.log("case 2");
          // continue;
        }

        const retPath = [];
        console.log(nodeOrder);
        for(let i = 0; i < nodeOrder.length; i++){
          retPath.push(this.nodePos[nodeOrder[i]])
        }
      
        retPath.push(this.goal);
        return retPath;
        // }


      
    }

    private getCenters(): Vector3[]{
      let obsCenters = [];
      for(let obj of this.obstacles){
        const vec = new Vector3(obj.position.x, obj.position.y, obj.position.z)
        obsCenters.push(vec);
      }
    
      return obsCenters;
    }

    // private nodePosSafeVec(): Vector3[]{
    //   let nodeCenters = [];
    //   for(let node of this.nodePos){
    //     const vec = new Vector3(node.x, node.y, node.z);
    //     nodeCenters.push(vec);
    //   }

    //   return nodeCenters;
    // }

    private generateRandomNodes(numNodes: number, circleCenters: Vector3[]){
        for (let i = 0; i < numNodes; i++){
          let randPos = new Vector3(Math.random() * 16 - 8, 0, Math.random()* 16 - 8);
          let insideAnyCircle = pointInCircleList(circleCenters, this.radius, this.obstacles.length,randPos,.2);
          //boolean insideBox = pointInBox(boxTopLeft, boxW, boxH, randPos);
          while (insideAnyCircle){
            randPos = new Vector3(Math.random() * 16 - 8, 0, Math.random()* 16 - 8);
            insideAnyCircle = pointInCircleList(circleCenters, this.radius,this.obstacles.length,randPos,.2);
            //insideBox = pointInBox(boxTopLeft, boxW, boxH, randPos);
          }
          this.nodePos[i] = randPos;
        }
    }

    private connectNeighbors(centers: Vector3[], radii: number, numObstacles: number, nodePos: Vector3[], numNodes: number){
      for (let i = 0; i < numNodes; i++){
          this.neighbors[i] = [];  //Clear neighbors list
          for (let j = 0; j < numNodes; j++){
          if (i == j) continue; //don't connect to myself 
          let dir = new Vector3();
          dir.subVectors(nodePos[j], nodePos[i]).normalize();
          // console.log("LENGTH:", dir.length());
          const distBetween = nodePos[i].distanceTo(nodePos[j]);
          const circleListCheck = rayCircleListIntersect(centers, radii, numObstacles, nodePos[i], dir, distBetween);
          if (!circleListCheck.hit){
              this.neighbors[i].push(j);
          }
          }
      }
  }

  private closestNode(point: Vector3, nodePos: Vector3[], numNodes: number, 
    centers: Vector3[], radii: number, numObstacles: number): number {
    let closestID = -1;
    let minDist = 999999;
    for (let i = 0; i < numNodes; i++){
  
      const queryNode = nodePos[i];
  
      // Make sure the point can see node in question
      // if (!this.canSeeEachOther(centers, radii, numObstacles, queryNode, point)) continue;
  
      const dist = queryNode.distanceTo(point);
      if (dist < minDist){
        closestID = i;
        minDist = dist;
      }
    }
    return closestID;
}

  private canSeeEachOther(centers: Vector3[], radii: number, numObstacles: number, goal: Vector3, start: Vector3): boolean {
    const dir = new Vector3();
    dir.subVectors(goal, start).normalize();
    const distBetween = goal.distanceTo(start);
    const circleListCheck = rayCircleListIntersect(centers, this.radius, numObstacles, start, dir, distBetween);
    return !circleListCheck.hit;
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
      path.unshift(-1);
      return path;
    }
      
    //print("\nReverse path: ");
    let prevNode = this.parent[goalID];
    path.unshift(goalID);
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