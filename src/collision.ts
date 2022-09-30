import {Vector3} from 'three';

//Returns true if the point is inside a circle
//You must consider a point as colliding if it's distance is <= eps
export function pointInCircle(center: Vector3, r: number, pointPos: Vector3, eps: number): boolean{
    const dist = pointPos.distanceTo(center);
    if (dist < r+eps){ //small safety factor
      return true;
    }
    return false;
  }
  
  //Returns true if the point is inside a list of circle
  //You must consider a point as colliding if it's distance is <= eps
export function pointInCircleList(centers: Vector3[], radii: number[], numObstacles: number, pointPos: Vector3, eps: number): boolean{
    for (let i = 0; i < numObstacles; i++){
      const center =  centers[i];
      const r = radii[i];
      if (pointInCircle(center,r,pointPos, eps)){
        return true;
      }
    }
    return false;
  }
  
  
export class hitInfo{
    public hit = false;
    public t = 9999999;
}

export function rayCircleIntersect(center: Vector3, r: number, l_start: Vector3, l_dir: Vector3, max_t: number): hitInfo{
    const hit = new hitInfo();
    
    //Step 2: Compute W - a displacement vector pointing from the start of the line segment to the center of the circle
      const toCircle = center.sub(l_start);
      const strokeWidth = 2;
      
      //Step 3: Solve quadratic equation for intersection point (in terms of l_dir and toCircle)
      const a = 1;  //Length of l_dir (we normalized it)
      const  b = -2*l_dir.dot(toCircle); //-2*dot(l_dir,toCircle)
      const  c = toCircle.lengthSq() - (r+strokeWidth)*(r+strokeWidth); //different of squared distances
      
      const d = b*b - 4*a*c; //discriminant 
      
      if (d >=0 ){ 
        //If d is positive we know the line is colliding, but we need to check if the collision line within the line segment
        //  ... this means t will be between 0 and the length of the line segment
        const t1 = (-b - Math.sqrt(d))/(2*a); //Optimization: we only need the first collision
        const t2 = (-b + Math.sqrt(d))/(2*a); //Optimization: we only need the first collision
        //println(hit.t,t1,t2);
        if (t1 > 0 && t1 < max_t){
          hit.hit = true;
          hit.t = t1;
        }
        else if (t1 < 0 && t2 > 0){
          hit.hit = true;
          hit.t = -1;
        }
        
      }
      
    return hit;
  }
  
export function rayCircleListIntersect(centers: Vector3[], radii: number[], numObstacles: number, l_start: Vector3, l_dir: Vector3, max_t: number){
    const hit = new hitInfo();
    hit.t = max_t;
    for (let i = 0; i < numObstacles; i++){
      const center = centers[i];
      const r = radii[i];
      
      const circleHit = rayCircleIntersect(center, r, l_start, l_dir, hit.t);
      if (circleHit.t > 0 && circleHit.t < hit.t){
        hit.hit = true;
        hit.t = circleHit.t;
      }
      else if (circleHit.hit && circleHit.t < 0){
        hit.hit = true;
        hit.t = -1;
      }
    }
    return hit;
  }
  