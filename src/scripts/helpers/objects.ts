import * as THREE from "three";
import * as CANNON from "cannon-es";
import { getRandomInt } from "./number";

const firePalette = ["FF0000", "FE5A00", "FF9A01", "FECE00", "FFE809"];

export const createFire = (
  camera: THREE.PerspectiveCamera,
  fire: THREE.Mesh,
  parameters: { width: number; height: number; depth: number },
  meshes: THREE.Object3D[],
  bodies: { body: CANNON.Body; isAlive: boolean }[],
  scene: THREE.Scene,
  world: CANNON.World,
  isLoaded: boolean
) => {
  let cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);
  let cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  const randomNumber = getRandomInt(5, 10);

  for (let i = 0; i < randomNumber; i++) {
    let isAlive = true;
    const positionRandomizer = getRandomInt(-2, 2);
    // fire mesh
    const fireClone = fire.clone();
    fireClone.position.set(
      cameraPosition.x + positionRandomizer * 0.5,
      cameraPosition.y + positionRandomizer * 0.1,
      cameraPosition.z
    );
    scene.add(fireClone);
    meshes.push(fireClone);

    // fire physics
    const fireShape = new CANNON.Box(
      new CANNON.Vec3(
        parameters.width / 2,
        parameters.height / 2,
        parameters.depth / 2
      )
    );

    const fireBody = new CANNON.Body({ mass: 1 });
    fireBody.addShape(fireShape);
    fireBody.position.set(
      fireClone.position.x,
      fireClone.position.y,
      fireClone.position.z
    );
    fireBody.velocity = new CANNON.Vec3(
      cameraDirection.x * 100,
      cameraDirection.y * 100,
      cameraDirection.z * 100
    );

    const fireObj = {
      body: fireBody,
      isAlive: true,
    };

    // Remove wind after 1 second
    setTimeout(() => {
      world.removeBody(fireBody);
      scene.remove(fireClone);
      fireObj.isAlive = false;
    }, 200);

    world.addBody(fireBody);
    bodies.push(fireObj);
    isLoaded = true;
  }
};
