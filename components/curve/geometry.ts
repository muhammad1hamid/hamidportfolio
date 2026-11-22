import * as THREE from "three";

export const corridorLength = 88;
export const walkLength = 77;
const up = new THREE.Vector3(0, 1, 0);
const points = [new THREE.Vector3(0, 0, 0)];
const samples = 352;

// Integrating a smooth heading gives a genuinely straight entrance followed by
// continuous right curvature. Every wall, camera and frame uses this centerline.
for (let index = 1; index <= samples; index++) {
  const distance = ((index - 0.5) / samples) * corridorLength;
  const bend = THREE.MathUtils.clamp((distance - 14) / 65, 0, 1);
  const heading = 1.15 * bend * bend * (3 - 2 * bend);
  points.push(
    points
      .at(-1)!
      .clone()
      .add(
        new THREE.Vector3(
          Math.sin(heading),
          0,
          -Math.cos(heading),
        ).multiplyScalar(corridorLength / samples),
      ),
  );
}
export const path = new THREE.CatmullRomCurve3(points, false, "centripetal");
path.arcLengthDivisions = 1408;

export function pathFrame(distance: number) {
  const t = THREE.MathUtils.clamp(distance / corridorLength, 0, 1);
  const position = path.getPointAt(t);
  const tangent = path.getTangentAt(t).normalize();
  const right = tangent.clone().cross(up).normalize();
  return { position, tangent, right };
}

export function wallAnchor(
  distance: number,
  side: "left" | "right",
  halfWidth: number,
) {
  const { position, tangent, right } = pathFrame(distance);
  const sign = side === "right" ? 1 : -1;
  const normal = right.clone().multiplyScalar(-sign);
  position.addScaledVector(right, sign * (halfWidth - 0.055));
  position.y = 1.9;
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(up.clone().cross(normal), up, normal),
  );
  return { position, quaternion, normal, tangent };
}

export function cameraPose(progress: number) {
  const { position, tangent } = pathFrame(progress * walkLength);
  position.y = 1.7;
  const look = pathFrame(
    Math.min(corridorLength, progress * walkLength + 3.5),
  ).position;
  look.y = position.y;
  const matrix = new THREE.Matrix4().lookAt(position, look, up);
  return {
    position,
    quaternion: new THREE.Quaternion().setFromRotationMatrix(matrix),
    tangent,
  };
}

export function ribbonGeometry(
  halfWidth: number,
  height: number,
  surface:
    "left" | "right" | "floor" | "ceiling" | "light-left" | "light-right",
  lightPositions: readonly number[] = [],
) {
  const vertices: number[] = [],
    indices: number[] = [],
    colors: number[] = [];
  const wall = surface === "left" || surface === "right";
  const divisions = wall ? 12 : surface === "floor" ? 8 : 1;
  for (let index = 0; index <= samples; index++) {
    const distance = (index / samples) * corridorLength;
    const { position, right } = pathFrame(distance);
    let sides = [-halfWidth, halfWidth],
      levels = [0, 0];
    if (surface === "left" || surface === "right") {
      sides = [
        surface === "left" ? -halfWidth : halfWidth,
        surface === "left" ? -halfWidth : halfWidth,
      ];
      levels = [0, height];
    } else if (surface === "ceiling") levels = [height, height];
    else if (surface.startsWith("light")) {
      const side = surface === "light-left" ? -1 : 1;
      sides = [side * (halfWidth - 0.16), side * (halfWidth - 0.2)];
      levels = [height - 0.018, height - 0.018];
    }
    for (let edge = 0; edge <= divisions; edge++) {
      const across = edge / divisions;
      const point = position
        .clone()
        .addScaledVector(
          right,
          THREE.MathUtils.lerp(sides[0], sides[1], across),
        );
      const y = THREE.MathUtils.lerp(levels[0], levels[1], across);
      vertices.push(point.x, y, point.z);
      // Static wall washes and contact shading give the matte architecture
      // depth without shadow maps, extra lights or per-frame shader work.
      let shade = 1;
      if (wall) {
        const wash = lightPositions.reduce(
          (sum, light) => sum + Math.exp(-((distance - light) ** 2) / 2.8),
          0,
        );
        const vertical = Math.exp(-((y - 2.5) ** 2) / 1.5);
        const contact = Math.min(1, y / 0.55, (height - y) / 0.5);
        shade = (0.48 + wash * vertical * 1.45) * (0.5 + contact * 0.5);
      } else if (surface === "floor") {
        const center = Math.sin(across * Math.PI);
        shade = 0.35 + center * 0.65;
      }
      colors.push(shade, shade * (wall ? 0.96 : 1), shade * (wall ? 0.9 : 1));
    }
    if (index < samples) {
      for (let edge = 0; edge < divisions; edge++) {
        const a = index * (divisions + 1) + edge;
        const b = a + divisions + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  if (surface === "left" || surface === "ceiling") {
    for (let index = 0; index < indices.length; index += 3) {
      [indices[index + 1], indices[index + 2]] = [
        indices[index + 2],
        indices[index + 1],
      ];
    }
  }
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export type CoverRect = { x: number; y: number; width: number; height: number };
export function coverRect(
  width: number,
  height: number,
  aspect: number,
  detail = false,
): CoverRect {
  const mobile = width < 768;
  const availableWidth = width * (detail ? 0.9 : mobile ? 0.72 : 0.5);
  const availableHeight = height * (detail ? 0.61 : mobile ? 0.31 : 0.45);
  const w = Math.min(availableWidth, availableHeight * aspect);
  const h = w / aspect;
  return {
    x: (width - w) / 2,
    y: detail
      ? Math.max(76, (height * 0.72 - h) / 2)
      : height * (mobile ? 0.36 : 0.41) - h / 2,
    width: w,
    height: h,
  };
}

export function centeredPose(
  camera: THREE.PerspectiveCamera,
  rect: CoverRect,
  viewport: { width: number; height: number },
  frameWidth: number,
) {
  const distance = 3.5;
  const worldHeight =
    2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
  const worldWidth = worldHeight * camera.aspect;
  const position = new THREE.Vector3(
    ((rect.x + rect.width / 2) / viewport.width - 0.5) * worldWidth,
    (0.5 - (rect.y + rect.height / 2) / viewport.height) * worldHeight,
    -distance,
  )
    .applyQuaternion(camera.quaternion)
    .add(camera.position);
  return {
    position,
    quaternion: camera.quaternion.clone(),
    scale: ((rect.width / viewport.width) * worldWidth) / frameWidth,
  };
}
