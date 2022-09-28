// import { CharacterControls } from './characterControls';
import * as THREE from 'three'
import { AnimationMixer, CameraHelper, Color, Object3D, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'


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
orbitControls.enablePan = true
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

//MOVEMENT
let movements: Vector3[] = [];
let objects: THREE.Object3D[] = [];
let dummy: THREE.Object3D;
let rotationSet = false;
const speed = .025;
// const textureLoader = new THREE.TextureLoader('');

function stopMovement() {
  movements = [];
}

const axesHelper = new THREE.AxesHelper( 5 );
axesHelper.setColors( new Color(0, 0, 255), new Color(255, 0,0), new Color(0, 255, 0));
axesHelper.position.set(-8, 0 , -8);
scene.add( axesHelper );


function move(agent: Object3D, destination: Vector3, dt: number){
  let curPos = new Vector2(agent.position.x, agent.position.z);
  let goalPos = new Vector2(destination.x, destination.z)
  
  let dir = goalPos.sub(curPos);

  if(!rotationSet){
    agent.lookAt(dir.x, 0, dir.y);
    rotationSet = true;
  }

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
  const pos3d = new Vector3(vel.x, 0, vel.y);
  agent.position.add(new Vector3(vel.x, 0, vel.y));
  // console.log("moved!")

  // let distance = Math.sqrt( diffX * diffX + diffY * diffY );

  // if(posX > newX){
  //   multiplierX = -1;
  // }

  // if(posY > newY){
  //   multiplierY = -1;
  // }

  // agent.position.x = agent.position.x + (speed*(diffX / distance)) * multiplierX;
  // agent.position.z = agent.position.z + (speed*(diffY / distance)) * multiplierY;
  // console.log("moving!", agent.position);
  //  // If the position is close we can call the movement complete.
  //  if (( Math.floor( agent.position.x ) <= Math.floor( newX ) + .3 && 
  //     Math.floor( agent.position.x ) >= Math.floor( newX ) - .3 ) &&
  //   ( Math.floor( agent.position.z ) <= Math.floor( newY ) + .3 && 
  //     Math.floor( agent.position.z ) >= Math.floor( newY ) - .3 )) {
  //   agent.position.x = Math.floor( agent.position.x );
  //   agent.position.z = Math.floor( agent.position.z );

  //   // Reset any movements.
  //   stopMovement();

  //   // Maybe move should return a boolean. True if completed, false if not. 
  //   }
}

// const controls = new TransformControls(camera, renderer.domElement)



// const outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
// const composer.addPass( outlinePass );
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
var cube = new THREE.Mesh( geometry, material );
cube.castShadow = true;

// Add cube to Scene
// scene.add( cube );


// // LIGHTS
// light()

// // FLOOR
// generateFloor()
let mixer: AnimationMixer;
//Load Model
new GLTFLoader().load('scalefix.gltf', function (gltf) {
    const model = gltf.scene;
    model.castShadow = true;
    model.traverse(c=>{
          c.castShadow = true;
    });
    dummy = model;
    console.log("dummy:", dummy);
    

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

// const loader = new FBXLoader();
// loader.load('mixamoWalk.fbx', (fbx) => {
//   fbx.scale.setScalar(0.01);
//   fbx.traverse(c=>{
//     c.castShadow = true;
//   });

//   const anim = new FBXLoader();
//   anim.load('mixamoWalk.fbx', (anim)=>{
//     const mixer = new THREE.AnimationMixer(fbx);
//     const idle = mixer.clipAction(anim.animations[0]);
//     idle.play();
//   })

//   scene.add(fbx);

//   scene.add(fbx);
// })

const clock = new THREE.Clock();

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

document.addEventListener( 'mousedown', onDocumentMouseDown );
let obj: THREE.Object3D;

function onDocumentMouseDown( event: any ) {   
  
  event.preventDefault();
  // if(event.which === 1){
  //   var mouse3D = new THREE.Vector3( ( event.clientX/ window.innerWidth ) * 2 - 1,   
  //                         -( event.clientY / window.innerHeight ) * 2 + 1,  
  //                           0.5 );     
  //   var raycaster =  new THREE.Raycaster();                                        
  //   raycaster.setFromCamera( mouse3D, camera );
  //   var intersects = raycaster.intersectObjects(scene.children);

    
  //   if ( intersects.length > 0 ) {
  //     if(!(intersects[0].object.geometry.type == 'PlaneGeometry')){
  //       obj = intersects[0].object;
  //       console.log(obj)
  //       if(obj.hasOwnProperty('material') && obj.material.hasOwnProperty('emissive')){
  //         obj.material.emissive.set(0xaaaaaa);
  //         // controls.attach(obj);
  //         // scene.add(controls);
  //       }
        
  //     }
  //   }
    let mouse3D = new THREE.Vector3( ( event.clientX/ window.innerWidth ) * 2 - 1,   
                          -( event.clientY / window.innerHeight ) * 2 + 1,  
                            0.5 );     

    var raycaster =  new THREE.Raycaster();                                        
    raycaster.setFromCamera( mouse3D, camera );

  // Grab all objects that can be intersected.
  var intersects = raycaster.intersectObjects( scene.children );
  if ( intersects.length > 0 ) {
    console.log("intersections!>")
    movements.push(intersects[ 0 ].point);
  }

  console.log('Movements' , movements);
  
}

// const controls = new DragControls( scene.children, camera, renderer.domElement );

// // add event listener to highlight dragged objects

// controls.addEventListener( 'dragstart', function ( event:any ) {

// 	event.object.material.emissive.set( 0xaaaaaa );

// } );

// controls.addEventListener( 'dragend', function ( event:any ) {

// 	event.object.material.emissive.set( 0x000000 );

// } );


var render = function () {
    requestAnimationFrame( render );
  
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
  
    // Render the scene
    renderer.render(scene, camera);
    
    
    

    if ( movements.length > 0 ) {
      if(mixer){
        mixer.update(clock.getDelta());
      }
      move( dummy, movements[ 0 ], clock.getDelta());
    }
  };
  
  render();