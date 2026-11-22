import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import * as THREE from "three";

async function load(file) {
  const source = ts.transpileModule(await readFile(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(source.replace('from "three"', `from "${import.meta.resolve("three")}"`)).toString("base64")}`
  );
}
const {
  pathFrame,
  wallAnchor,
  cameraPose,
  ribbonGeometry,
  centeredPose,
  coverRect,
} = await load("components/curve/geometry.ts");
const { nextMode } = await load("components/curve/machine.ts");
const up = new THREE.Vector3(0, 1, 0);
for (const distance of [0, 4, 10, 25, 50, 74, 86]) {
  const frame = pathFrame(distance);
  assert.ok(Math.abs(frame.tangent.length() - 1) < 1e-10);
  assert.ok(Math.abs(frame.right.dot(frame.tangent)) < 1e-10);
  for (const side of ["left", "right"]) {
    const anchor = wallAnchor(distance, side, 3.2);
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(
      anchor.quaternion,
    );
    assert.ok(normal.distanceTo(anchor.normal) < 1e-10);
    assert.ok(anchor.position.clone().setY(0).distanceTo(frame.position) > 3.1);
    assert.ok(
      normal.dot(frame.position.clone().sub(anchor.position).setY(0)) > 3,
    );
    assert.ok(
      up.clone().applyQuaternion(anchor.quaternion).distanceTo(up) < 1e-10,
    );
  }
}
assert.equal(pathFrame(10).position.x, 0);
assert.ok(pathFrame(65).position.x > pathFrame(30).position.x);
for (const surface of ["left", "right", "floor", "ceiling"]) {
  const mesh = ribbonGeometry(3.2, 4.3, surface);
  const normal = new THREE.Vector3().fromBufferAttribute(
    mesh.getAttribute("normal"),
    0,
  );
  const inward = {
    left: new THREE.Vector3(1, 0, 0),
    right: new THREE.Vector3(-1, 0, 0),
    floor: new THREE.Vector3(0, 1, 0),
    ceiling: new THREE.Vector3(0, -1, 0),
  }[surface];
  assert.ok(normal.dot(inward) > 0.99, `${surface} normals face the interior`);
  mesh.dispose();
}
for (const [width, height] of [
  [320, 568],
  [390, 844],
  [1440, 900],
  [1920, 1080],
]) {
  const camera = new THREE.PerspectiveCamera(
    width < 768 ? 82 : 62,
    width / height,
    0.05,
    100,
  );
  const pose = cameraPose(0.48);
  camera.position.copy(pose.position);
  camera.quaternion.copy(pose.quaternion);
  camera.updateMatrixWorld();
  for (const detail of [false, true]) {
    const rect = coverRect(width, height, 1.5, detail),
      focus = centeredPose(camera, rect, { width, height }, 2.7);
    const matrix = new THREE.Matrix4().compose(
      focus.position,
      focus.quaternion,
      new THREE.Vector3().setScalar(focus.scale),
    );
    const corner = new THREE.Vector3(-1.35, 0.9, 0)
      .applyMatrix4(matrix)
      .project(camera);
    assert.ok(Math.abs(((corner.x + 1) * width) / 2 - rect.x) < 1e-8);
    assert.ok(Math.abs(((1 - corner.y) * height) / 2 - rect.y) < 1e-8);
  }
}
let mode = "INITIALIZING";
for (const event of [
  "SCENE_READY",
  "FRAME_ACTIVATE",
  "FOCUS_READY",
  "DETAIL_OPEN",
  "DETAIL_READY",
  "DETAIL_CLOSE",
  "COVER_RETURNED",
  "WALL_RETURNED",
  "RESTORED",
])
  mode = nextMode(mode, event);
assert.equal(mode, "WALK");
assert.equal(nextMode("DETAIL_OPENING", "FRAME_ACTIVATE"), "DETAIL_OPENING");
assert.equal(nextMode("PREVIEW_OPENING", "PREVIEW_DISMISS"), "PREVIEW_CLOSING");
assert.equal(nextMode("DETAIL", "CONTEXT_LOST"), "FALLBACK");
console.log(
  "Path frames, inward normals, straight/right geometry, responsive 3D-to-HTML projection and guarded state transitions passed.",
);
