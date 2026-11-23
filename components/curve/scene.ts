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
import { populateArchitecture } from "./architecture";

type Options = {
  host: HTMLElement;
  projects: CorridorProject[];
  onProgress: (progress: number, nearby: number[]) => void;
  onSelect: (index: number) => void;
  onFailure: (message: string) => void;
  onResize?: (rect: CoverRect) => void;
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
  onResize,
}: Options) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#101214");
  scene.fog = new THREE.Fog("#171b1e", 16, 54);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 100);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const backdrop = document.createElement("canvas");
  backdrop.className = "curve-frozen-world";
  backdrop.setAttribute("aria-hidden", "true");
  host.prepend(backdrop);
  renderer.domElement.className = "curve-live-world";
  const architectural = new THREE.Group();
  scene.add(architectural);
  scene.add(new THREE.HemisphereLight(0xc8ced1, 0x292420, 2.1));
  scene.add(new THREE.AmbientLight(0xc8ced1, 0.42));
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
    const width = 3.05 + (project.rank % 3 === 0 ? 0.12 : 0);
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
  let architectureMobile: boolean | null = null;
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
  let savedPose: Pose | null = null;
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

  // One static 2D copy blurs only the frozen architecture. The same selected
  // Three.js frame stays sharp in the original renderer above it.
  function freezeBackground() {
    if (selected < 0) return;
    architectural.visible = true;
    frames.forEach((f, index) => {
      f.group.visible = index !== selected;
    });
    scene.background = new THREE.Color("#101214");
    renderer.render(scene, camera);
    const ratio = Math.min(1, 1440 / width);
    backdrop.width = Math.round(width * ratio);
    backdrop.height = Math.round(height * ratio);
    backdrop
      .getContext("2d")
      ?.drawImage(renderer.domElement, 0, 0, backdrop.width, backdrop.height);
    architectural.visible = false;
    frames.forEach((f, index) => {
      f.group.visible = index === selected && !coverHidden;
    });
    scene.background = null;
    renderer.render(scene, camera);
    host.dataset.focused = "true";
  }
  function restoreBackground() {
    architectural.visible = true;
    frames.forEach((f) => {
      f.group.visible = true;
    });
    scene.background = new THREE.Color("#101214");
    renderer.render(scene, camera);
    delete host.dataset.focused;
    backdrop.width = backdrop.height = 1;
  }

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
      mobile ? 10 : 12.5,
    );
    // Proximity lighting follows the already-damped camera, with a continuous
    // brightness curve. Loaded screenshot colors are never affected by ACES.
    for (const f of frames) {
      if (f.material.map) {
        const distance = Math.abs(
          f.project.distance - progress * walkLength - 6.5,
        );
        f.material.color.setScalar(
          f.project.rank === selected
            ? 1
            : 0.78 + 0.22 * (1 - THREE.MathUtils.smoothstep(distance, 0, 22)),
        );
      }
    }
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
  let releaseArchitecture = () => {};
  function architecture() {
    releaseArchitecture();
    frames.forEach((f) => {
      f.anchor = wallAnchor(
        f.project.distance,
        f.project.wallSide,
        architectureMobile ? 2.12 : 3.2,
      );
      if (f.project.rank !== selected) {
        f.group.position.copy(f.anchor.position);
        f.group.quaternion.copy(f.anchor.quaternion);
      }
    });
    releaseArchitecture = populateArchitecture(
      architectural,
      frames,
      !!architectureMobile,
    );
  }
  function resize() {
    const bounds = host.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) return;
    const nextMobile = width < 768;
    mobile = nextMobile;
    // A room does not change its world dimensions on device rotation. Keeping
    // the initial geometry preserves exact saved wall transforms during resize.
    if (architectureMobile === null) {
      architectureMobile = mobile;
      architecture();
    }
    camera.aspect = width / height;
    camera.fov = mobile ? (architectureMobile ? 82 : 94) : 62;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(quality);
    renderer.setSize(width, height);
    if (selected >= 0) {
      freezeBackground();
      onResize?.(
        coverRect(
          width,
          height,
          frames[selected].project.imageAspect,
          view === "detail",
        ),
      );
      const mode = view;
      const finish = resumeTransition;
      tween?.kill();
      moveTo(mode, coverHidden ? 0 : 0.22, finish);
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
    if (mode === "wall" && savedPose) return savedPose;
    return centeredPose(
      camera,
      coverRect(width, height, f.project.imageAspect, mode === "detail"),
      { width, height },
      f.width,
    );
  }
  function moveTo(mode: typeof view, duration: number, done?: () => void) {
    tween?.kill();
    const spatial = mode === "wall" || view === "wall";
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
      ease: "power3.inOut",
      onUpdate: () => {
        f.group.position.lerpVectors(start.position, end.position, state.t);
        if (spatial)
          f.group.position.addScaledVector(
            f.anchor.normal,
            Math.sin(Math.PI * state.t) * 0.24,
          );
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
      if (mobile || event.pointerType !== "mouse" || frozen) return;
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
      host.dataset.target = target.toFixed(7);
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
      savedPose = {
        position: frames[index].group.position.clone(),
        quaternion: frames[index].group.quaternion.clone(),
        scale: frames[index].group.scale.x,
      };
      freezeBackground();
      moveTo("preview", 0.82, done);
    },
    expand(done: () => void) {
      host.dataset.story = "true";
      moveTo("detail", 1.0, done);
    },
    contract(done: () => void) {
      delete host.dataset.story;
      coverHidden = false;
      frames[selected].group.visible = true;
      moveTo("preview", 0.85, done);
    },
    returnToWall(done: () => void) {
      moveTo("wall", 0.82, () => {
        restoreBackground();
        selected = -1;
        frozen = false;
        hoverIndex = -1;
        savedPose = null;
        last = performance.now();
        resize();
        done();
      });
    },
    setCovered(value: boolean) {
      coverHidden = value;
      if (selected >= 0) frames[selected].group.visible = !value;
      renderer.render(scene, camera);
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
          distance: f.project.distance,
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
        architecture: {
          floorTitles: architectural.children.filter(
            (node) => node.userData.floorTitle,
          ).length,
          installation: architectural.children.some(
            (node) => node.userData.installation === "THE CONVERGENCE",
          ),
        },
        ...textures.stats(),
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        gpuTextures: renderer.info.memory.textures,
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
      releaseArchitecture();
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
      backdrop.remove();
    },
  };
}

export type CorridorScene = ReturnType<typeof createCorridor>;
