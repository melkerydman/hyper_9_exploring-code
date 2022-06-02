import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

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
  camera.position.set(0, 0, 250);

  // SCENE
  scene = new THREE.Scene();
  scene.add(new THREE.AxesHelper(50));

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // LIGHT
  const light = new THREE.AmbientLight();
  scene.add(light);

  // GROUND
  const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  groundMaterial.color.setHSL(0.095, 1, 0.75);

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // ground.position.y = -33;
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  //CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement);

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
