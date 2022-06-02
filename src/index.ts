import "./style.css";
import * as THREE from "three";

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

  // RENDERER

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function render() {
  renderer.render(scene, camera);
}
