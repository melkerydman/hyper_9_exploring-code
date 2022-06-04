import "../style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { getRandomInt } from "./helpers/number";
import { BlendingSrcFactor } from "three";

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

init();
animate();

function init() {
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
  scene.background = new THREE.Color("skyblue");

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

  if (blocker && instructions) {
    instructions.addEventListener("click", function () {
      controls.lock();
    });

    controls.addEventListener("lock", function () {
      instructions.style.display = "none";
      blocker.style.display = "none";
    });

    controls.addEventListener("unlock", function () {
      blocker.style.display = "block";
      instructions.style.display = "";
    });
  }
  scene.add(controls.getObject());
  const onKeyDown = function (e: KeyboardEvent) {
    console.log(controls.isLocked);
    switch (e.code) {
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
    color: 0x808080,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // CUBE
  const cubeGeometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);
  const cubeMaterial = new THREE.MeshPhysicalMaterial({
    // wireframe: true,
    color: 0x00ff00,
  });

  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  for (let i = 0; i < 50; i++) {
    const cubeClone = cube.clone();
    cubeClone.position.x = getRandomInt(-5, 6);
    cubeClone.position.y = cube.geometry.parameters.height / 2; // Place item on ground
    cubeClone.position.z = getRandomInt(-5, 6);
    console.dir(cubeClone);
    scene.add(cubeClone);
  }

  // EVENT LISTENERS
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {
    console.log("animate");
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 100.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 100.0 * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior
  }

  prevTime = time;

  render();
  stats.update();
}

function render() {
  renderer.render(scene, camera);
}
