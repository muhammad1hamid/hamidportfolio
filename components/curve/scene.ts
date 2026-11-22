import * as THREE from "three";
import gsap from "gsap";
import type { CorridorProject } from "./projects";
import {
  cameraPose,
  centeredPose,
  coverRect,
  pathFrame,
  ribbonGeometry,
  wallAnchor,
  walkLength,
  type CoverRect,
} from "./geometry";
import { FrameTextures } from "./textures";

type Options = {
  host: HTMLElement;
  projects: CorridorProject[];
  onProgress: (progress: number, nearby: number[]) => void;
  onSelect: (index: number) => void;
  onFailure: (message: string) => void;
};
type Pose = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
};

export function createCorridor({
  host,
  projects,
  onProgress,
  onSelect,
  onFailure,
}: Options) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#101214");
  scene.fog = new THREE.Fog("#171b1e", 16, 54);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 100);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const architectural = new THREE.Group();
  scene.add(architectural);
  scene.add(new THREE.HemisphereLight(0xc8ced1, 0x292420, 2.1));
  const key = new THREE.DirectionalLight(0xffe6d0, 2.0);
  key.position.set(-4, 7, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc0d8e1, 0.75);
  fill.position.set(4, 3, -10);
  scene.add(fill);
  const eyeLight = new THREE.PointLight(0xffd4ab, 7, 22, 2);
  scene.add(eyeLight);

  const plane = new THREE.PlaneGeometry(1, 1);
  const rimGeometry = new THREE.BoxGeometry(1, 1, 0.035);
  const frames = projects.map((project) => {
    const width = 2.65 + (project.rank % 3 === 0 ? 0.12 : 0);
    const group = new THREE.Group();
    const rim = new THREE.Mesh(
      rimGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x111417,
        roughness: 0.56,
        metalness: 0.4,
      }),
    );
    rim.scale.set(width + 0.075, width / project.imageAspect + 0.075, 1);
    rim.position.z = -0.022;
    group.add(rim);
    const material = new THREE.MeshBasicMaterial({
      color: 0x343739,
      toneMapped: false,
    });
    const image = new THREE.Mesh(plane, material);
    image.scale.set(width, width / project.imageAspect, 1);
    image.userData.index = project.rank;
    group.add(image);
    scene.add(group);
    return {
      project,
      group,
      image,
      material,
      width,
      anchor: wallAnchor(project.distance, project.wallSide, 3.2),
    };
  });
  let width = 1,
    height = 1,
    mobile = false;
  let target = 0,
    progress = 0,
    selected = -1,
    frozen = false,
    disposed = false;
  let frame = 0,
    last = 0,
    hoverTimer = 0,
    hoverIndex = -1,
    lastReport = "";
  let tween: gsap.core.Tween | undefined;
  let resumeTransition: (() => void) | undefined;
  let view: "wall" | "preview" | "detail" = "wall";
  let coverHidden = false;
  let snapshot: {
    projectId: string;
    progress: number;
    camera: number[];
    wall: number[];
    aspect: number;
    viewport: { width: number; height: number };
  } | null = null;
  let slowFrames = 0,
    measured = 0,
    totalFrameMs = 0,
    renderCount = 0;
  let quality = Math.min(devicePixelRatio, 1.5);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const abort = new AbortController();
  const textures = new FrameTextures(invalidate);

  function invalidate() {
    if (!disposed && !document.hidden && !coverHidden && !frame)
      frame = requestAnimationFrame(render);
  }
  function render(now: number) {
    frame = 0;
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    const moving = !frozen && Math.abs(target - progress) > 0.00001;
    if (moving) {
      progress += (target - progress) * (1 - Math.exp(-dt * 11));
      if (Math.abs(target - progress) < 0.00001) progress = target;
      const pose = cameraPose(progress);
      camera.position.copy(pose.position);
      camera.quaternion.copy(pose.quaternion);
      if (last && now - last < 250) {
        measured++;
        totalFrameMs += now - last;
        slowFrames =
          now - last > 45 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
        if (slowFrames === 50 && quality > 0.8) {
          quality = 0.8;
          renderer.setPixelRatio(quality);
        }
        if (slowFrames > 180) {
          onFailure(
            "Gallery view is ready for smoother browsing on this device.",
          );
          return;
        }
      }
    }
    last = now;
    textures.update(
      projects,
      frames.map((f) => f.material),
      progress * walkLength,
      frames[selected]?.project.id,
    );
    eyeLight.position
      .copy(camera.position)
      .add(new THREE.Vector3(0, 1.3, -3).applyQuaternion(camera.quaternion));
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    renderCount++;
    const nearby = frames
      .filter(
        (f) =>
          f.project.distance - progress * walkLength > 0.6 &&
          f.project.distance - progress * walkLength < 16,
      )
      .map((f) => f.project.rank);
    const report = `${Math.round(progress * 1000)}:${nearby.join(",")}`;
    if (report !== lastReport) {
      lastReport = report;
      onProgress(progress, nearby);
    }
    host.dataset.progress = progress.toFixed(7);
    if (moving || tween?.isActive()) invalidate();
  }
  function architecture() {
    architectural.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.geometry.dispose();
        (node.material as THREE.Material).dispose();
      }
    });
    architectural.clear();
    const half = mobile ? 2.12 : 3.2;
    for (const surface of [
      "left",
      "right",
      "floor",
      "ceiling",
      "light-left",
      "light-right",
    ] as const) {
      const light = surface.startsWith("light");
      const color =
        surface === "floor"
          ? 0x25292c
          : surface === "ceiling"
            ? 0x292d30
            : 0x41474a;
      const material = light
        ? new THREE.MeshBasicMaterial({
            color: 0x938879,
            side: THREE.DoubleSide,
          })
        : new THREE.MeshStandardMaterial({
            color,
            vertexColors: true,
            roughness: 0.94,
            metalness: 0.04,
            emissive: 0x101214,
            emissiveIntensity: 0.35,
            side: THREE.DoubleSide,
          });
      const mesh = new THREE.Mesh(
        ribbonGeometry(
          half,
          4.3,
          surface,
          projects
            .filter((project) => project.wallSide === surface)
            .map((project) => project.distance),
        ),
        material,
      );
      mesh.userData.occluder = !light;
      architectural.add(mesh);
    }
    // Quiet transverse floor joints provide distance cues without a central rail.
    for (let d = 4; d < 88; d += 8.1) {
      const f = pathFrame(d);
      const joint = new THREE.Mesh(
        new THREE.PlaneGeometry(half * 2, 0.012),
        new THREE.MeshBasicMaterial({
          color: 0x15191c,
          side: THREE.DoubleSide,
        }),
      );
      joint.position.copy(f.position);
      joint.position.y = 0.004;
      joint.rotation.set(
        -Math.PI / 2,
        0,
        Math.atan2(f.tangent.x, -f.tangent.z),
      );
      architectural.add(joint);
    }
    frames.forEach((f) => {
      f.anchor = wallAnchor(f.project.distance, f.project.wallSide, half);
      if (f.project.rank !== selected) {
        f.group.position.copy(f.anchor.position);
        f.group.quaternion.copy(f.anchor.quaternion);
      }
      const mount = new THREE.Mesh(
        new THREE.BoxGeometry(f.width * 0.46, 0.025, 0.16),
        new THREE.MeshStandardMaterial({
          color: 0x343333,
          roughness: 0.48,
          metalness: 0.55,
          emissive: 0x62503a,
          emissiveIntensity: 0.32,
        }),
      );
      mount.position
        .copy(f.anchor.position)
        .add(
          new THREE.Vector3(0, f.width / f.project.imageAspect / 2 + 0.22, 0),
        );
      mount.quaternion.copy(f.anchor.quaternion);
      architectural.add(mount);
    });
    const end = pathFrame(87.5);
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(half * 2, 4.3),
      new THREE.MeshStandardMaterial({
        color: 0x343330,
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    );
    wall.position.copy(end.position);
    wall.position.y = 2.15;
    wall.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        end.right,
        new THREE.Vector3(0, 1, 0),
        end.tangent.clone().negate(),
      ),
    );
    architectural.add(wall);
  }
  function resize() {
    const bounds = host.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) return;
    const nextMobile = width < 768;
    if (nextMobile !== mobile || !architectural.children.length) {
      mobile = nextMobile;
      architecture();
    }
    camera.aspect = width / height;
    camera.fov = mobile ? 82 : 62;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(quality);
    renderer.setSize(width, height);
    if (selected >= 0) {
      const mode = view;
      const finish = resumeTransition;
      tween?.kill();
      moveTo(mode, 0.22, finish);
    }
    invalidate();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const initial = cameraPose(0);
  camera.position.copy(initial.position);
  camera.quaternion.copy(initial.quaternion);

  function destination(mode: typeof view): Pose {
    const f = frames[selected];
    if (mode === "wall")
      return {
        position: f.anchor.position.clone(),
        quaternion: f.anchor.quaternion.clone(),
        scale: 1,
      };
    return centeredPose(
      camera,
      coverRect(width, height, f.project.imageAspect, mode === "detail"),
      { width, height },
      f.width,
    );
  }
  function moveTo(mode: typeof view, duration: number, done?: () => void) {
    tween?.kill();
    view = mode;
    resumeTransition = done;
    const f = frames[selected];
    if (!f) return;
    const start: Pose = {
      position: f.group.position.clone(),
      quaternion: f.group.quaternion.clone(),
      scale: f.group.scale.x,
    };
    const end = destination(mode),
      state = { t: 0 };
    tween = gsap.to(state, {
      t: 1,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        f.group.position.lerpVectors(start.position, end.position, state.t);
        f.group.quaternion.slerpQuaternions(
          start.quaternion,
          end.quaternion,
          state.t,
        );
        f.group.scale.setScalar(
          THREE.MathUtils.lerp(start.scale, end.scale, state.t),
        );
        invalidate();
      },
      onComplete: () => {
        f.group.position.copy(end.position);
        f.group.quaternion.copy(end.quaternion);
        f.group.scale.setScalar(end.scale);
        resumeTransition = undefined;
        invalidate();
        done?.();
      },
    });
  }
  function hit(event: PointerEvent) {
    if (frozen) return -1;
    const bounds = host.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / width) * 2 - 1,
      (-(event.clientY - bounds.top) / height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const eligible = frames.filter((f) => {
      const d = f.project.distance - progress * walkLength;
      return d > 0.6 && d < 16;
    });
    const hits = raycaster.intersectObjects(eligible.map((f) => f.image));
    const obstruction = raycaster.intersectObjects(
      architectural.children.filter((mesh) => mesh.userData.occluder),
    )[0];
    if (
      hits.length &&
      obstruction &&
      obstruction.distance < hits[0].distance - 0.03
    )
      return -1;
    return hits.length ? hits[0].object.userData.index : -1;
  }
  host.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" || frozen) return;
      const index = hit(event);
      host.style.cursor = index < 0 ? "default" : "pointer";
      if (index === hoverIndex) return;
      clearTimeout(hoverTimer);
      hoverIndex = index;
      if (index >= 0)
        hoverTimer = window.setTimeout(() => {
          if (!frozen) onSelect(index);
        }, 120);
    },
    { signal: abort.signal },
  );
  host.addEventListener(
    "pointerleave",
    () => {
      clearTimeout(hoverTimer);
      hoverIndex = -1;
    },
    { signal: abort.signal },
  );
  let down = { x: 0, y: 0 };
  host.addEventListener(
    "pointerdown",
    (e) => {
      down = { x: e.clientX, y: e.clientY };
    },
    { signal: abort.signal },
  );
  host.addEventListener(
    "pointerup",
    (e) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
      const index = hit(e);
      if (index >= 0) onSelect(index);
    },
    { signal: abort.signal },
  );
  renderer.domElement.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      onFailure("Gallery view is ready while 3D is unavailable.");
    },
    { signal: abort.signal },
  );
  document.addEventListener(
    "visibilitychange",
    () => {
      last = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else invalidate();
    },
    { signal: abort.signal },
  );
  resize();
  invalidate();

  return {
    setProgress(value: number, immediate = false) {
      if (frozen) return;
      target = THREE.MathUtils.clamp(value, 0, 1);
      if (immediate) {
        progress = target;
        const p = cameraPose(progress);
        camera.position.copy(p.position);
        camera.quaternion.copy(p.quaternion);
      }
      if (!frame) last = performance.now();
      invalidate();
    },
    focus(index: number, done: () => void) {
      if (frozen || !frames[index]) return;
      clearTimeout(hoverTimer);
      selected = index;
      frozen = true;
      target = progress;
      camera.updateMatrixWorld();
      frames[index].group.updateMatrixWorld();
      snapshot = {
        projectId: frames[index].project.id,
        progress,
        camera: camera.matrixWorld.toArray(),
        wall: frames[index].group.matrixWorld.toArray(),
        aspect: frames[index].project.imageAspect,
        viewport: { width, height },
      };
      moveTo("preview", 0.62, done);
    },
    expand(done: () => void) {
      moveTo("detail", 0.76, done);
    },
    contract(done: () => void) {
      coverHidden = false;
      frames[selected].group.visible = true;
      moveTo("preview", 0.42, done);
    },
    returnToWall(done: () => void) {
      moveTo("wall", 0.62, () => {
        selected = -1;
        frozen = false;
        hoverIndex = -1;
        last = performance.now();
        done();
      });
    },
    setCovered(value: boolean) {
      coverHidden = value;
      if (selected >= 0) frames[selected].group.visible = !value;
      if (!value) invalidate();
    },
    rect(detail = false): CoverRect {
      return coverRect(
        width,
        height,
        frames[selected]?.project.imageAspect ?? 1.5,
        detail,
      );
    },
    coverSource() {
      const image = frames[selected]?.material.map?.image as
        HTMLImageElement | undefined;
      return (
        image?.src || `/images/curve/${frames[selected]?.project.id}-160.webp`
      );
    },
    getProgress() {
      return progress;
    },
    inspect() {
      return {
        progress,
        target,
        selected,
        snapshot,
        camera: camera.matrixWorld.toArray(),
        frames: frames.map((f) => ({
          id: f.project.id,
          side: f.project.wallSide,
          world: f.group.matrixWorld.toArray(),
          anchor: new THREE.Matrix4()
            .compose(
              f.anchor.position,
              f.anchor.quaternion,
              new THREE.Vector3(1, 1, 1),
            )
            .toArray(),
          center: f.group.position.clone().project(camera).toArray(),
          imageCorners: [
            new THREE.Vector3(-0.5, 0.5, 0),
            new THREE.Vector3(0.5, -0.5, 0),
          ].map((point) =>
            point.applyMatrix4(f.image.matrixWorld).project(camera).toArray(),
          ),
        })),
        ...textures.stats(),
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        renderCount,
        dpr: renderer.getPixelRatio(),
        meanMovingFrameMs: measured ? totalFrameMs / measured : 0,
      };
    },
    dispose() {
      disposed = true;
      clearTimeout(hoverTimer);
      cancelAnimationFrame(frame);
      tween?.kill();
      observer.disconnect();
      abort.abort();
      textures.dispose();
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
          const material = node.material as THREE.Material;
          material.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

export type CorridorScene = ReturnType<typeof createCorridor>;
