import "../style.css";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { getRandomInt } from "./helpers/number";
import CannonUtils from "./helpers/cannonUtils";
import CannonDebugRenderer from "./helpers/cannonDebugRenderer";
import { recognizeSounds } from "./soundRecogniser";
import {
  updateStaticMeshPosition,
  updateMovingMeshPosition,
} from "./helpers/physics";
import { createFire } from "./helpers/objects";

let sounds: { label: string; confidence: number; isActive: boolean }[];
function updateSound(s: []) {
  sounds = s;
}
// Create wind object
const createWind = () => {
  // Cube physics
  const wind = {
    shape: new CANNON.Sphere(0.3),
    body: new CANNON.Body({ mass: 1 }),
    isAlive: true,
  };
  wind.body.addShape(wind.shape);

  let vec = new THREE.Vector3();
  camera.getWorldPosition(vec);
  wind.body.position.set(vec.x, vec.y, vec.z);

  let vector = new THREE.Vector3(); // create once and reuse it!
  camera.getWorldDirection(vector);

  // Adding velocity to wind
  wind.body.velocity = new CANNON.Vec3(
    vector.x * getRandomInt(-50, 50),
    vector.y * getRandomInt(-50, 50),
    vector.z * 100
  );

  // Remove wind after 1 second
  setTimeout(() => {
    world.removeBody(wind.body);
    wind.isAlive = false;
  }, 200);

  windBodies.push(wind);

  world.addBody(wind.body);
};

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  controls: PointerLockControls;
let stats: Stats;

stats = Stats();
document.body.appendChild(stats.dom);

let moveForward = false,
  moveBackward = false,
  moveLeft = false,
  moveRight = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Physics
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
let cubeMeshes: THREE.Object3D[] = [];
let cubeBodies: CANNON.Body[] = [];
let cubeLoaded = false;
let fireLoaded = false;

// Wind
// const windBodies = [] as CANNON.Body[];
const windBodies = [] as {
  shape: CANNON.Sphere;
  body: CANNON.Body;
  isAlive: boolean;
}[];

// Fire

const fireGeometry = new THREE.BoxBufferGeometry(0.3, 0.3, 0.3);
const fireMaterial = new THREE.MeshPhysicalMaterial({
  // wireframe: true,
  color: "orange",
});
const fire = new THREE.Mesh(fireGeometry, fireMaterial);

const fireParameters = {
  width: fireGeometry.parameters.width,
  height: fireGeometry.parameters.height,
  depth: fireGeometry.parameters.depth,
};
let fireMeshes = [] as THREE.Object3D[];
const fireBodies = [] as {
  body: CANNON.Body;
  isAlive: boolean;
}[];

let cannonDebugRenderer: CannonDebugRenderer;

init();
animate();

function init() {
  recognizeSounds(updateSound);

  // CAMERA
  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.set(0, 1.5, 20);

  // SCENE
  scene = new THREE.Scene();
  scene.add(new THREE.AxesHelper(50));
  const color = 0x171717;
  scene.background = new THREE.Color(color);
  scene.fog = new THREE.Fog(color, 10, 50);

  // const sky = new THREE.Mesh(
  //   new THREE.SphereGeometry(100, 32, 32),
  //   new THREE.MeshBasicMaterial({
  //     color: "skyblue",
  //     // color: 0x8080ff,
  //     side: THREE.BackSide,
  //   })
  // );
  // scene.add(sky);

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //CONTROLS
  controls = new PointerLockControls(camera, renderer.domElement);

  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");
  const aim = document.getElementById("aim");

  if (blocker && instructions && aim) {
    instructions.addEventListener("click", function () {
      controls.lock();
    });

    controls.addEventListener("lock", function () {
      instructions.style.display = "none";
      blocker.style.display = "none";
      aim.style.display = "block";
    });

    controls.addEventListener("unlock", function () {
      blocker.style.display = "block";
      instructions.style.display = "";
      aim.style.display = "none";
    });
  }
  scene.add(controls.getObject());
  const onKeyDown = function (e: KeyboardEvent) {
    switch (e.code) {
      case "KeyQ":
        // createWind();
        createFire(
          camera,
          fire,
          fireParameters,
          fireMeshes,
          fireBodies,
          scene,
          world,
          fireLoaded
        );
        break;

      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;
    }
  };

  const onKeyUp = function (e: KeyboardEvent) {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // LIGHT
  const ambientLight = new THREE.AmbientLight(0xff0000, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(-5, 15, -5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
  );
  scene.add(directionalLightHelper);

  // GROUND
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshLambertMaterial({
    color: "green",
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  // Ground physics
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 });
  console.log("groundBody", groundBody);
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
  );
  world.addBody(groundBody);

  // CUBE
  const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const cubeParameters = {
    width: cubeGeometry.parameters.width,
    height: cubeGeometry.parameters.height,
    depth: cubeGeometry.parameters.depth,
  };
  const cubeMaterial = new THREE.MeshPhysicalMaterial({
    // wireframe: true,
    color: 0x00ff00,
  });

  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  for (let i = 0; i < 50; i++) {
    const cubeClone = cube.clone();
    cubeClone.position.x = getRandomInt(-5, 6);
    // cubeClone.position.y = cube.geometry.parameters.height / 2; // Place item on ground
    cubeClone.position.y = 10; // Place item on ground
    cubeClone.position.z = getRandomInt(-5, 6);
    scene.add(cubeClone);
    cubeMeshes.push(cubeClone);

    // Cube physics
    const cubeShape = new CANNON.Box(
      new CANNON.Vec3(
        cubeParameters.width / 2,
        cubeParameters.height / 2,
        cubeParameters.depth / 2
      )
    );
    const cubeBody = new CANNON.Body({ mass: 1 });
    cubeBody.addShape(cubeShape);
    cubeBody.position.x = cubeClone.position.x;
    cubeBody.position.y = cubeClone.position.y;
    cubeBody.position.z = cubeClone.position.z;
    world.addBody(cubeBody);
    cubeBodies.push(cubeBody);
  }
  cubeLoaded = true;

  // DEBUG;
  cannonDebugRenderer = new CannonDebugRenderer(scene, world);

  // EVENT LISTENERS
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

const clock = new THREE.Clock();
let d;

function animate() {
  // SOUND
  let blow = sounds?.filter((sound) => {
    return sound.label === "Blow";
  });
  if (blow) {
    if (blow[0].isActive) {
      createWind();
    }
  }
  requestAnimationFrame(animate);

  //PHYSICS
  // Copy coordinates from Cannon to Three.js
  updateStaticMeshPosition(cubeMeshes, cubeBodies, cubeLoaded);
  updateMovingMeshPosition(fireMeshes, fireBodies, fireLoaded);
  if (clock) {
    d = Math.min(clock.getDelta(), 0.1);
    world.step(d);

    cannonDebugRenderer.update();

    const time = performance.now();

    // MOVEMENT
    if (controls.isLocked === true) {
      const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (moveForward || moveBackward)
        velocity.z -= direction.z * 100.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 100.0 * delta;

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      controls.getObject().position.y += velocity.y * delta; // new behavior
    }

    prevTime = time;

    // Wind
    // go through bullets array and update position
    // remove bullets when appropriate
    for (let index = 0; index < windBodies.length; index++) {
      if (windBodies[index] === undefined) continue;
      if (windBodies[index].isAlive === false) {
        windBodies.splice(index, 1);
        continue;
      }
    }
    for (let index = 0; index < fireBodies.length; index++) {
      if (fireBodies[index] === undefined) continue;
      if (fireBodies[index].isAlive === false) {
        fireBodies.splice(index, 1);
        fireMeshes.splice(index, 1);
        continue;
      }
    }
    render();
    stats.update();
  }

  function render() {
    renderer.render(scene, camera);
  }

  // const createFire = () => {
  //   let cameraPosition = new THREE.Vector3();
  //   camera.getWorldPosition(cameraPosition);
  //   let cameraDirection = new THREE.Vector3();
  //   camera.getWorldDirection(cameraDirection);

  //   const randomNumber = getRandomInt(5, 10);

  //   for (let i = 0; i < randomNumber; i++) {
  //     const positionRandomizer = getRandomInt(-2, 2);
  //     // fire mesh
  //     const fireClone = fire.clone();
  //     fireClone.position.set(
  //       cameraPosition.x + positionRandomizer * 0.1,
  //       cameraPosition.y + positionRandomizer * 0.1,
  //       cameraPosition.z
  //     );
  //     scene.add(fireClone);
  //     fireMeshes.push(fireClone);

  //     // fire physics
  //     const fireShape = new CANNON.Box(
  //       new CANNON.Vec3(
  //         fireParameters.width / 2,
  //         fireParameters.height / 2,
  //         fireParameters.depth / 2
  //       )
  //     );

  //     const fireBody = new CANNON.Body({ mass: 1 });
  //     fireBody.addShape(fireShape);
  //     fireBody.position.set(
  //       fireClone.position.x,
  //       fireClone.position.y,
  //       fireClone.position.z
  //     );
  //     fireBody.velocity = new CANNON.Vec3(
  //       // cameraDirection.x * getRandomInt(-50, 50),
  //       // cameraDirection.y * getRandomInt(-50, 50),
  //       cameraDirection.x * 100,
  //       cameraDirection.y * 100,
  //       cameraDirection.z * 100
  //     );
  //     world.addBody(fireBody);
  //     fireBodies.push(fireBody);
  //     fireLoaded = true;
  //   }
  // };

  // FUNCTIONS – move to separate files
}
