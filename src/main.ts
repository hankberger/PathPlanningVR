// import { CharacterControls } from './characterControls';
import * as THREE from 'three'
import { CameraHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshToonMaterial( { color: "#433F81" } );
// var cube = new THREE.Mesh( geometry, material );
// cube.castShadow = true;

// // Add cube to Scene
// scene.add( cube );


// // LIGHTS
// light()

// // FLOOR
// generateFloor()

//Load Model
new GLTFLoader().load('soldier.glb', function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    scene.add(model);

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map()
    gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
        animationsMap.set(a.name, mixer.clipAction(a))
    })
});

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

    const WIDTH = 80
    const LENGTH = 80

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshBasicMaterial(
        {
           
        })
   
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2
    scene.add(floor)
}

generateFloor();

// function light() {
//     scene.add(new THREE.AmbientLight(0xffffff, 0.7))

//     const dirLight = new THREE.DirectionalLight(0xffffff, 1)
//     dirLight.position.set(- 60, 100, - 10);
//     dirLight.castShadow = true;
//     dirLight.shadow.camera.top = 50;
//     dirLight.shadow.camera.bottom = - 50;
//     dirLight.shadow.camera.left = - 50;
//     dirLight.shadow.camera.right = 50;
//     dirLight.shadow.camera.near = 0.1;
//     dirLight.shadow.camera.far = 200;
//     dirLight.shadow.mapSize.width = 4096;
//     dirLight.shadow.mapSize.height = 4096;
//     scene.add(dirLight);
//     // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
// }


var render = function () {
    requestAnimationFrame( render );
  
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
  
    // Render the scene
    renderer.render(scene, camera);
  };
  
  render();