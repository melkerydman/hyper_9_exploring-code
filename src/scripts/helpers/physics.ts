import * as THREE from "three";
import * as CANNON from "cannon-es";

// A function that updates the position of a Mesh in accordance with position of its physical representation
export const updateStaticMeshPosition = (
  meshes: THREE.Object3D[],
  bodies: CANNON.Body[],
  isLoaded: boolean
) => {
  if (isLoaded === true) {
    meshes.forEach((mesh, i) => {
      mesh.position.set(
        bodies[i].position.x,
        bodies[i].position.y,
        bodies[i].position.z
      );
      mesh.quaternion.set(
        bodies[i].quaternion.x,
        bodies[i].quaternion.y,
        bodies[i].quaternion.z,
        bodies[i].quaternion.w
      );
    });
  }
};
export const updateMovingMeshPosition = (
  meshes: THREE.Object3D[],
  bodies: { body: CANNON.Body; isAlive: boolean }[],
  isLoaded: boolean
) => {
  // if (bodies.length !== 0) {
  meshes.forEach((mesh, i) => {
    console.log("bodies: ", typeof bodies[i]);
    mesh.position.set(
      bodies[i].body.position.x,
      bodies[i].body.position.y,
      bodies[i].body.position.z
    );
    mesh.quaternion.set(
      bodies[i].body.quaternion.x,
      bodies[i].body.quaternion.y,
      bodies[i].body.quaternion.z,
      bodies[i].body.quaternion.w
    );
  });
  // }
};
