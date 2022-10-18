//@ts-nocheck
import * as THREE from 'three'
import { AnimationMixer, Color, Object3D, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import Pathing from './PathingBetter';
import { pointInCircleList } from './collision';
import { VRButton } from 'three/addons/webxr/VRButton.js';
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;

//UI
const uiObj = document.getElementById("numobj");

const slider = document.getElementById('myRange');

if(uiObj){
  uiObj.innerHTML = slider.value;
}
slider?.addEventListener('input', (event)=>{
  if(uiObj){
    uiObj.innerHTML = slider.value;
  }

  while(slider.value > objects.length){
    const posx = Math.random()*16 - 8;
    const posz = Math.random()*16 - 8;
    var newBarrel = barrel.clone();
    newBarrel.position.x = posx;
    newBarrel.position.z = posz;
    newBarrel.position.y = .5;
    newBarrel.castShadow = true;
    newBarrel.receiveShadow = true;

    objects.push(newBarrel);
    scene.add(newBarrel)
  }

  while(slider.value < objects.length){
    let cyl = objects.pop();
    scene.remove(cyl);
  }

  scene.remove(goal)
  generateGoal();
})

document.getElementById("goalbttn")?.addEventListener('click', (event)=>{
  const freeSpace = setFreeLocation(0, getCenters());
  goal.position.set(freeSpace.x, 0, freeSpace.z);
  return;
});

document.getElementById("objbttn")?.addEventListener('click', (event)=>{
  for(let obj of objects){
    const posx = Math.random()*16 - 8;
    const posz = Math.random()*16 - 8;
    obj.position.x = posx;
    obj.position.z = posz;
    obj.position.y = .5;
  }
  return;
});

document.getElementById("startbttn")?.addEventListener('click', (event)=>{
  const path = new Pathing();
  movements = path.getPath();
  return;
})

let path = new Pathing();

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xADD8E6);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement);

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

//MOVEMENT
let movements: Vector3[] = [];
let objects: THREE.Object3D[] = [];
let dummy: THREE.Object3D;
let rotationSet = false;
const speed = .04;

//OBSTACLES
const numObstacles = slider.value;
const goalGeo = new THREE.CylinderGeometry( 5, 5, 20, 32 );
const goalMat = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
const goal = new THREE.Mesh( goalGeo, goalMat );

function generateGoal(){
  const freeSpace = setFreeLocation(0, getCenters());
  goal.position.set(freeSpace.x, 0, freeSpace.z);
  goal.scale.set(.1, .01, .1);
  goal.material.transparent = true;
  goal.material.opacity = .65
  scene.add( goal );
}



function setFreeLocation(numNodes: number, circleCenters: Vector3[]): Vector3{
    let randPos = new Vector3(Math.random() * 16 - 8, 0, Math.random()* 16 - 8);
    let insideAnyCircle = pointInCircleList(circleCenters, .5, objects.length, randPos,.5);
    //boolean insideBox = pointInBox(boxTopLeft, boxW, boxH, randPos);
    while (insideAnyCircle){
      randPos = new Vector3(Math.random() * 16 - 8, 0, Math.random()* 16 - 8);
      insideAnyCircle = pointInCircleList(circleCenters, .5, objects.length, randPos,.5);
      //insideBox = pointInBox(boxTopLeft, boxW, boxH, randPos);
    }

    return randPos;
}

function getCenters(): Vector3[]{
  let obsCenters = [];
  for(let obj of objects){
    const vec = new Vector3(obj.position.x, obj.position.y, obj.position.z)
    obsCenters.push(vec);
  }

  return obsCenters;
}

const axesHelper = new THREE.AxesHelper( 5 );
axesHelper.setColors( new Color(0, 0, 255), new Color(255, 0,0), new Color(0, 255, 0));
axesHelper.position.set(-8, 0 , -8);
scene.add( axesHelper );


function move(agent: Object3D, destination: Vector3, dt: number){
  if(!destination){
    alert("No Path Found! Randomize Goal / Objects and Try again.");
    movements = [];
    return;
  }

  let curPos = new Vector2(agent.position.x, agent.position.z);
  let goalPos = new Vector2(destination.x, destination.z)

  let dir = new Vector2();
  dir.subVectors(goalPos, curPos);

  let goalRotation = Math.atan2(dir.x, dir.y);



  if(Math.abs((agent.rotation.y) - goalRotation) < .15){
    //Do nothing
  } else if(agent.rotation.y < (agent.rotation.y + goalRotation) / 2){
    agent.rotation.y += .1;
  } else {
    agent.rotation.y -= .1;
  }
  // agent.rotation.y = (agent.rotation.y + goalRotation) / 2;

  // if(!rotationSet){
  //   // agent.lookAt(destination.x, 0, destination.z);
  //   agent.rotation.y = goalRotation;
  //   rotationSet = true;
  // }

  if(dir.length() < .25){
    movements.shift();
    rotationSet = false;
    return;
  }

  if(!((speed*dt) > dir.length())){
    dir.normalize();
  } else {
    agent.position.x = destination.x;
    agent.position.z = destination.z;
  }

  const vel = dir.multiplyScalar(speed);
  agent.position.add(new Vector3(vel.x, 0, vel.y));
  return;
}

let mixer: AnimationMixer;
//Load Model
new GLTFLoader().load('scalefix.gltf', function (gltf) {
    const model = gltf.scene;
    model.castShadow = true;
    model.traverse(c=>{
          c.castShadow = true;
    });
    const dummyposx = Math.random()*16 - 8;
    const dummyposz = Math.random()*16 - 8;
    model.position.x = dummyposx;
    model.position.z = dummyposz;
    // orbitControls.target = model.position;
    

    dummy = model;

    orbitControls.target = dummy.position;
    orbitControls.update();
    
    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    mixer = new THREE.AnimationMixer(model);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map();
    console.log(animationsMap);
    gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
        animationsMap.set(a.name, mixer.clipAction(a))
    })
    let anim = animationsMap.get('animation_0');
    console.log(anim);
    anim?.play();
    scene.add(model);
});

let barrel: Object3D;
new FBXLoader().load('darkblue.fbx', function(fbx){
  fbx.scale.setScalar(0.004);
  fbx.position.y = .6;
  fbx.traverse((child)=>{
    child.castShadow = true;
  })
  
  barrel = fbx;
  createObstacles();
});

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

function generateFloor() {
    // TEXTURE
    const textureLoader = new THREE.TextureLoader();
    const floorColor = textureLoader.load('/gridbox.png');

    const WIDTH = 80
    const LENGTH = 80

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshStandardMaterial(
        {
           map: floorColor
        })
        
        wrapAndRepeatTexture(material.map);
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2
    scene.add(floor)
}

generateFloor();

function wrapAndRepeatTexture (map: THREE.Texture) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.x = map.repeat.y = 10
}

function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
    // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}

light();

// const geometry = new THREE.CylinderGeometry(.4, .4, 1.2, 16);
// const material = new THREE.MeshPhongMaterial( {color: 0xffffff} );
// const AAA = new THREE.Mesh(geometry, material);
// AAA.position.y = .6;
// scene.add(AAA);

function createObstacles(){
  for(let i = 0; i < numObstacles; i++){
    const posx = Math.random()*16 - 8;
    const posz = Math.random()*16 - 8;
    const rotation = Math.random() * 360;
    console.log(barrel)
    var newBarrel = barrel.clone();
    newBarrel.position.x = posx;
    newBarrel.position.z = posz;
    newBarrel.position.y = .5;
    newBarrel.rotation.y = rotation;

    newBarrel.castShadow = true;
    newBarrel.receiveShadow = true;

    objects.push(newBarrel);
    scene.add(newBarrel)
  }

  generateGoal();
}



// document.addEventListener( 'mousedown', onDocumentMouseDown );
// function onDocumentMouseDown( event: any ) {   
  
//   event.preventDefault();
//   // if(event.which === 1){
//   //   var mouse3D = new THREE.Vector3( ( event.clientX/ window.innerWidth ) * 2 - 1,   
//   //                         -( event.clientY / window.innerHeight ) * 2 + 1,  
//   //                           0.5 );     
//   //   var raycaster =  new THREE.Raycaster();                                        
//   //   raycaster.setFromCamera( mouse3D, camera );
//   //   var intersects = raycaster.intersectObjects(scene.children);

    
//   //   if ( intersects.length > 0 ) {
//   //     if(!(intersects[0].object.geometry.type == 'PlaneGeometry')){
//   //       obj = intersects[0].object;
//   //       console.log(obj)
//   //       if(obj.hasOwnProperty('material') && obj.material.hasOwnProperty('emissive')){
//   //         obj.material.emissive.set(0xaaaaaa);
//   //         // controls.attach(obj);
//   //         // scene.add(controls);
//   //       }
        
//   //     }
//   //   }
//   let mouse3D = new THREE.Vector3( ( event.clientX/ window.innerWidth ) * 2 - 1,   
//                         -( event.clientY / window.innerHeight ) * 2 + 1,  
//                           0.5 );     

//   var raycaster =  new THREE.Raycaster();                                        
//   raycaster.setFromCamera( mouse3D, camera );

//   // Grab all objects that can be intersected.
//   var intersects = raycaster.intersectObjects( scene.children );
//   if ( intersects.length > 0 ) {
//     movements.push(intersects[ 0 ].point);
//   }
// }

//Pathing Helper functions
export function getObjects(){
  return objects;
}

export function getStart(){
  console.log(dummy.position);
  return dummy.position;
}

export function getGoal(){
  return goal.position;
}

let nodeVisualzation: Object3D[] = [];
export function visuzlizeNodes(nodes: Vector3[]){
  for(let i of nodeVisualzation){
    scene.remove(i);
  }
  nodeVisualzation = [];
  const geometry = new THREE.CylinderGeometry(.1, .1, .2, 8);
  const material = new THREE.MeshPhongMaterial( {color: 0xffffff} );
  
  
  for(let node of nodes){
    const AAA = new THREE.Mesh(geometry, material);
    AAA.position.x = node.x;
    AAA.position.y = .05;
    AAA.position.z = node.z;
    // dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
    
    nodeVisualzation.push(AAA);  
    // dot.position.add(node);
    // dot.position.y = .1;
    scene.add( AAA );
  }

  return;
}

export function visualizeNeighbors(nodes: Vector3[], neighbors: number[][]){
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });
  for(let i = 0; i < nodes.length; i++){
    for(let j = 0; j < neighbors[i].length; j++){
      const points = [];
      points.push(nodes[i]);
      points.push(nodes[neighbors[i][j]]);
      const geometry = new THREE.BufferGeometry().setFromPoints( points );
      const line = new THREE.Line( geometry, material );
      scene.add(line);
    }
  }
}


export function visualizePath(nodes: Vector3[], neighbors: number[][], path: Vector3[]){
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });
  // for(let i = 0; i < nodes.length; i++){
  //   for(let j = 0; j < neighbors[i].length; j++){
  //     const points = [];
  //     points.push(nodes[i]);
  //     points.push(nodes[neighbors[i][j]]);
  //     const geometry = new THREE.BufferGeometry().setFromPoints( points );
  //     const line = new THREE.Line( geometry, material );
  //     scene.add(line);
  //   }
  // }
  visuzlizeNodes(path);

  for(let i = 0; i < path.length - 1; i++){
    const points = [];
    points.push(path[i]);
    points.push(path[i+1]);
    console.log(path, points);
    if(points.length === 0) return;
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    
    scene.add(line);
    nodeVisualzation.push(line);
  }

  
}

const clock = new THREE.Clock();
var render = function () {
    requestAnimationFrame( render );
  
    renderer.render(scene, camera);
    
    if ( movements.length > 0 ) {
      if(mixer){
        mixer.update(clock.getDelta());
      }
      move( dummy, movements[ 0 ], clock.getDelta());
      orbitControls.target = dummy.position;
      orbitControls.update();
    }
  };
  
render();