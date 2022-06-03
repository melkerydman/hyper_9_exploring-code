import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { getRandomInt } from "./helpers/number";

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let stats: Stats;

stats = Stats();
document.body.appendChild(stats.dom);

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
  camera.position.set(5, 5, 25);

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
  const controls = new OrbitControls(camera, renderer.domElement);

  // LIGHT
  const ambientLight = new THREE.AmbientLight(0xff0000, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(-5, 15, -5);
  scene.add(directionalLight);

  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;

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

  render();
  stats.update();
}

function render() {
  renderer.render(scene, camera);
}
