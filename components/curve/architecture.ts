import * as THREE from "three";
import { corridorHalfWidth, pathFrame, ribbonGeometry } from "./geometry";
import type { CorridorProject } from "./projects";

type Mount = {
  project: CorridorProject;
  width: number;
  anchor: { position: THREE.Vector3; quaternion: THREE.Quaternion };
};
const up = new THREE.Vector3(0, 1, 0);

function grain() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(128, 128);
  let seed = 91;
  for (let i = 0; i < image.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const value = 222 + (seed % 11);
    image.data.set([value, value, value, 255], i);
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function titleTexture(title: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 112;
  const ctx = canvas.getContext("2d")!;
  const family = getComputedStyle(document.body).fontFamily;
  let size = 52;
  ctx.font = `600 ${size}px ${family}`;
  while (ctx.measureText(title).width > 728 && size > 22)
    ctx.font = `600 ${--size}px ${family}`;
  ctx.fillStyle = "#dedbd3";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, 384, 56);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

/** Every fixture shares the corridor frame; no viewport decorations. */
export function populateArchitecture(
  root: THREE.Group,
  frames: Mount[],
  mobile: boolean,
) {
  const half = mobile ? 2.12 : 3.2;
  const height = mobile ? 3.4 : 3.75;
  const stone = grain();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const plane = new THREE.PlaneGeometry(1, 1);
  const dark = new THREE.MeshStandardMaterial({
    color: 0x23282b,
    roughness: 0.89,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x686d6d,
    roughness: 0.48,
    metalness: 0.65,
  });
  const seam = new THREE.MeshBasicMaterial({ color: 0x191d20 });
  const warm = new THREE.MeshBasicMaterial({
    color: 0xd9cdb4,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const orange = new THREE.MeshStandardMaterial({
    color: 0xe7854c,
    roughness: 0.5,
    metalness: 0.35,
    emissive: 0x7d3213,
    emissiveIntensity: 0.25,
  });
  const batches = new Map<THREE.Material, THREE.Matrix4[]>();
  const lines = new Map<number, number[]>();
  const addBox = (
    position: THREE.Vector3,
    quaternion: THREE.Quaternion,
    scale: THREE.Vector3,
    material: THREE.Material,
  ) => {
    const items = batches.get(material) ?? [];
    items.push(new THREE.Matrix4().compose(position, quaternion, scale));
    batches.set(material, items);
  };
  const localBox = (
    matrix: THREE.Matrix4,
    xyz: number[],
    size: number[],
    material: THREE.Material,
  ) => {
    const p = new THREE.Vector3(...xyz).applyMatrix4(matrix);
    const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
    addBox(p, q, new THREE.Vector3(...size), material);
  };
  const line = (matrix: THREE.Matrix4, points: number[][], color: number) => {
    const vertices = lines.get(color) ?? [];
    for (let i = 1; i < points.length; i++) {
      for (const point of [points[i - 1], points[i]])
        vertices.push(
          ...new THREE.Vector3(...point).applyMatrix4(matrix).toArray(),
        );
    }
    lines.set(color, vertices);
  };

  for (const surface of [
    "left",
    "right",
    "floor",
    "ceiling",
    "light-left",
    "light-right",
  ] as const) {
    const light = surface.startsWith("light");
    const ceiling = surface === "ceiling";
    const material = light
      ? warm
      : new THREE.MeshStandardMaterial({
          color: surface === "floor" ? 0x454a4c : ceiling ? 0x4a4f52 : 0x3d4448,
          map: stone,
          vertexColors: true,
          roughness: 0.94,
          metalness: 0.06,
          emissive: ceiling ? 0x32383c : 0x171d21,
          emissiveIntensity: ceiling ? 0.38 : 0.16,
          side: THREE.DoubleSide,
        });
    const mesh = new THREE.Mesh(
      ribbonGeometry(
        half,
        height,
        surface,
        frames
          .filter((f) => f.project.wallSide === surface)
          .map((f) => f.project.distance),
      ),
      material,
    );
    mesh.userData.occluder = !light;
    root.add(mesh);
  }

  // Shared instanced panel joints, ceiling baffles and recessed fixture housings.
  for (let d = 3.2; d < 88; d += mobile ? 6.4 : 4.3) {
    const frame = pathFrame(d);
    const h = corridorHalfWidth(d, half);
    const q = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        frame.right,
        up,
        frame.tangent.clone().negate(),
      ),
    );
    addBox(
      frame.position.clone().setY(0.003),
      q,
      new THREE.Vector3(h * 2, 0.006, 0.012),
      seam,
    );
    addBox(
      frame.position.clone().setY(height - 0.025),
      q,
      new THREE.Vector3(h * 2, 0.045, 0.04),
      dark,
    );
    for (const side of [-1, 1]) {
      addBox(
        frame.position
          .clone()
          .addScaledVector(frame.right, side * (h - 0.005))
          .setY(height / 2),
        q,
        new THREE.Vector3(0.015, height, 0.022),
        seam,
      );
    }
  }

  frames.forEach(({ project, anchor, width }) => {
    const pictureHeight = width / project.imageAspect;
    const matrix = new THREE.Matrix4().compose(
      anchor.position,
      anchor.quaternion,
      new THREE.Vector3(1, 1, 1),
    );
    localBox(
      matrix,
      [0, 0, -0.045],
      [width + 0.18, pictureHeight + 0.18, 0.035],
      dark,
    );
    localBox(
      matrix,
      [0, pictureHeight / 2 + 0.22, 0.015],
      [width * 0.57, 0.045, 0.18],
      metal,
    );
    localBox(
      matrix,
      [0, pictureHeight / 2 + 0.194, 0.09],
      [width * 0.45, 0.009, 0.035],
      warm,
    );
    const titleMap = titleTexture(project.title);
    const titleMaterial = new THREE.MeshBasicMaterial({
      map: titleMap,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    const plaque = new THREE.Mesh(plane, titleMaterial);
    plaque.scale.set(1.86, (1.86 * 112) / 768, 1);
    plaque.position.copy(
      new THREE.Vector3(0, -pictureHeight / 2 - 0.25, 0.02).applyMatrix4(
        matrix,
      ),
    );
    plaque.quaternion.copy(anchor.quaternion);
    plaque.userData.title = project.title;
    root.add(plaque);
    const floorFrame = pathFrame(project.distance - 1.7);
    const floorLabel = new THREE.Mesh(plane, titleMaterial);
    floorLabel.scale.set(
      mobile ? 1.7 : 2.55,
      ((mobile ? 1.7 : 2.55) * 112) / 768,
      1,
    );
    floorLabel.position
      .copy(floorFrame.position)
      .addScaledVector(
        floorFrame.right,
        (project.wallSide === "left" ? -1 : 1) * half * 0.43,
      );
    floorLabel.position.y = 0.012;
    floorLabel.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(floorFrame.right, floorFrame.tangent, up),
    );
    floorLabel.userData.floorTitle = project.title;
    root.add(floorLabel);
    // Small engraved connection diagrams alternate with clear wall breathing space.
    if (project.rank % (mobile ? 5 : 3) === 0) {
      const side = project.wallSide === "left" ? -1 : 1;
      const p = pathFrame(project.distance + 2.0);
      const n = p.right.clone().multiplyScalar(-side);
      const graphic = new THREE.Matrix4().makeBasis(up.clone().cross(n), up, n);
      graphic.setPosition(
        p.position
          .addScaledVector(
            p.right,
            side * (corridorHalfWidth(project.distance, half) - 0.018),
          )
          .setY(2.1),
      );
      line(
        graphic,
        [
          [-0.36, -0.22, 0],
          [-0.36, 0.22, 0],
          [0.06, 0.22, 0],
          [0.06, -0.22, 0],
          [-0.36, -0.22, 0],
        ],
        0x59615f,
      );
      line(
        graphic,
        [
          [0.06, 0, 0],
          [0.38, 0, 0],
          [0.38, 0.34, 0],
          [0.6, 0.34, 0],
        ],
        0x9d7452,
      );
      line(
        graphic,
        [
          [-0.23, 0.08, 0],
          [-0.06, 0.08, 0],
          [-0.06, -0.03, 0],
        ],
        0x59615f,
      );
    }
  });

  // Recessed, gently curved end wall, with a three-depth sculptural installation.
  const end = pathFrame(87.5);
  const endQ = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(end.right, up, end.tangent.clone().negate()),
  );
  const terminal = new THREE.Group();
  terminal.position.copy(end.position);
  terminal.quaternion.copy(endQ);
  terminal.userData.installation = "THE CONVERGENCE";
  const endHalf = corridorHalfWidth(87.5, half);
  const wallGeo = new THREE.PlaneGeometry(endHalf * 2, height, 32, 1);
  const vertices = wallGeo.getAttribute("position");
  for (let i = 0; i < vertices.count; i++) {
    const u = vertices.getX(i) / endHalf;
    vertices.setZ(i, -0.3 * (1 - u * u));
  }
  wallGeo.computeVertexNormals();
  const endWall = new THREE.Mesh(
    wallGeo,
    new THREE.MeshStandardMaterial({
      color: 0x3a4143,
      roughness: 0.87,
      emissive: 0x181c1e,
      emissiveIntensity: 0.25,
    }),
  );
  endWall.position.y = height / 2;
  root.add(terminal);
  terminal.add(endWall);
  const installation = new THREE.Group();
  installation.position.set(0, 1.95, -0.245);
  installation.scale.setScalar(mobile ? 0.66 : 1);
  terminal.add(installation);
  // Separate beveled mounting islands leave the actual wall visible between
  // relief elements, rather than presenting another flat rectangular poster.
  const beveled = (
    w: number,
    h: number,
    depth: number,
    material: THREE.Material,
  ) => {
    const shape = new THREE.Shape();
    const r = Math.min(0.055, w / 4, h / 4);
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.012,
        bevelSegments: 2,
        steps: 1,
        curveSegments: 3,
      }),
      material,
    );
  };
  for (const [x, w, h] of [
    [-1.46, 0.57, 1.7],
    [0, 0.88, 1.3],
    [1.46, 0.57, 1.7],
  ]) {
    const island = beveled(w, h, 0.065, dark);
    island.position.set(x, 0, 0.005);
    installation.add(island);
  }
  const relief = new THREE.MeshStandardMaterial({
    color: 0xb9bcb6,
    roughness: 0.46,
    metalness: 0.68,
  });
  for (const side of [-1, 1]) {
    for (const y of [-0.55, 0, 0.55]) {
      const points = [
        [side * 1.5, y, 0.1],
        [side * 1.12, y, 0.1],
        [side * 0.85, y * 0.65, 0.14],
        [side * 0.48, y * 0.35, 0.14],
        [side * 0.24, 0, 0.2],
      ].map((p) => new THREE.Vector3(...p));
      const wire = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          mobile ? 12 : 24,
          0.012,
          5,
          false,
        ),
        relief,
      );
      installation.add(wire);
      const node = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.23, 0.045),
        metal,
      );
      node.position.set(side * 1.49, y, 0.1);
      installation.add(node);
      const inset = new THREE.Mesh(
        new THREE.BoxGeometry(0.21, 0.16, 0.012),
        dark,
      );
      inset.position.copy(node.position).add(new THREE.Vector3(0, 0, 0.029));
      installation.add(inset);
      for (let i = 0; i < 2; i++) {
        const engraving = new THREE.Mesh(
          new THREE.BoxGeometry(0.12 - i * 0.025, 0.008, 0.008),
          relief,
        );
        engraving.position.set(side * 1.49, y + 0.028 - i * 0.04, 0.141);
        installation.add(engraving);
      }
    }
  }
  // An abstract H: two brushed piers, an orange connective bridge, no text billboard.
  for (const x of [-0.22, 0.22]) {
    const pier = beveled(0.115, 0.72, 0.16, relief);
    pier.position.set(x, 0, 0.19);
    installation.add(pier);
  }
  const bridge = beveled(0.42, 0.105, 0.17, orange);
  bridge.position.set(0, 0, 0.24);
  bridge.rotation.z = 0.22;
  installation.add(bridge);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.018, 0.03), warm);
  slit.position.set(0, 1.16, 0.04);
  installation.add(slit);
  const signature = new THREE.Mesh(
    plane,
    new THREE.MeshBasicMaterial({
      map: titleTexture("THE CONVERGENCE"),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  signature.scale.set(1.65, 0.24, 1);
  signature.position.set(0, -1.05, 0.012);
  installation.add(signature);
  const glow = new THREE.PointLight(0xffd5a6, mobile ? 4 : 7, 10, 2);
  glow.position.set(0, 2.9, 1.2);
  terminal.add(glow);

  for (const [material, transforms] of batches) {
    const mesh = new THREE.InstancedMesh(box, material, transforms.length);
    transforms.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    root.add(mesh);
  }
  for (const [color, vertices] of lines) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    root.add(
      new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.65,
        }),
      ),
    );
  }
  return () => {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const maps = new Set<THREE.Texture>();
    root.traverse((node) => {
      if (node instanceof THREE.Mesh || node instanceof THREE.LineSegments) {
        geometries.add(node.geometry);
        const list = Array.isArray(node.material)
          ? node.material
          : [node.material];
        for (const material of list) {
          materials.add(material);
          const map = (material as THREE.MeshStandardMaterial).map;
          if (map) maps.add(map);
        }
      }
    });
    maps.forEach((map) => map.dispose());
    materials.forEach((material) => material.dispose());
    geometries.forEach((geometry) => geometry.dispose());
    root.clear();
  };
}
