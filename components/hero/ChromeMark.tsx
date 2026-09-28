"use client";

import { useEffect, useRef } from "react";

export function ChromeMark() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = host.current;
    if (
      !target ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("(max-width: 700px)").matches
    )
      return;
    let disposed = false;
    let cleanup = () => {};
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        try {
          const T = await import("three");
          if (disposed) return;
          const scene = new T.Scene();
          const camera = new T.PerspectiveCamera(
            32,
            target.clientWidth / target.clientHeight,
            0.1,
            30,
          );
          camera.position.z = 7;
          const renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
          renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
          renderer.setSize(target.clientWidth, target.clientHeight);
          renderer.setClearColor(0x000000, 0);
          target.appendChild(renderer.domElement);
          target.classList.add("has-canvas");
          const mark = new T.Group();
          const material = new T.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.85,
            roughness: 0.26,
          });
          const geometry = new T.BoxGeometry(0.52, 2.4, 0.6);
          const horizontal = new T.BoxGeometry(1.7, 0.52, 0.6);
          [-0.85, 0.85].forEach((x) => {
            const mesh = new T.Mesh(geometry, material);
            mesh.position.x = x;
            mark.add(mesh);
          });
          mark.add(new T.Mesh(horizontal, material));
          const edges = new T.EdgesGeometry(geometry);
          const edgeMaterial = new T.LineBasicMaterial({
            color: 0xeeeeee,
            transparent: true,
            opacity: 0.48,
          });
          [-0.85, 0.85].forEach((x) => {
            const edge = new T.LineSegments(edges, edgeMaterial);
            edge.position.x = x;
            mark.add(edge);
          });
          scene.add(mark, new T.AmbientLight(0xffffff, 1.7));
          const key = new T.DirectionalLight(0xffffff, 7);
          key.position.set(-3, 4, 5);
          scene.add(key);
          const rim = new T.DirectionalLight(0xadb9c4, 4);
          rim.position.set(3, -2, 1);
          scene.add(rim);
          let px = 0,
            py = 0,
            frame = 0,
            visible = true;
          const move = (e: MouseEvent) => {
            const rect = target.getBoundingClientRect();
            px = ((e.clientX - rect.left) / rect.width - 0.5) * 0.2;
            py = ((e.clientY - rect.top) / rect.height - 0.5) * 0.12;
          };
          const render = (time: number) => {
            if (!visible || document.hidden) {
              frame = 0;
              return;
            }
            mark.rotation.y +=
              (-0.38 + Math.sin(time * 0.00025) * 0.12 + px - mark.rotation.y) *
              0.035;
            mark.rotation.x += (0.15 + py - mark.rotation.x) * 0.035;
            mark.rotation.z = -0.1;
            renderer.render(scene, camera);
            frame = requestAnimationFrame(render);
          };
          const start = () => {
            if (!frame && visible && !document.hidden)
              frame = requestAnimationFrame(render);
          };
          const visibility = new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            start();
          });
          visibility.observe(target);
          const resize = new ResizeObserver(() => {
            if (!target.clientWidth) return;
            camera.aspect = target.clientWidth / target.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(target.clientWidth, target.clientHeight);
          });
          resize.observe(target);
          target.addEventListener("mousemove", move);
          document.addEventListener("visibilitychange", start);
          start();
          cleanup = () => {
            cancelAnimationFrame(frame);
            resize.disconnect();
            visibility.disconnect();
            target.removeEventListener("mousemove", move);
            document.removeEventListener("visibilitychange", start);
            geometry.dispose();
            horizontal.dispose();
            edges.dispose();
            material.dispose();
            edgeMaterial.dispose();
            renderer.dispose();
            renderer.domElement.remove();
            target.classList.remove("has-canvas");
          };
        } catch {
          /* A typographic monogram remains when WebGL is unavailable. */
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(target);
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = () => {
      if (preference.matches) {
        disposed = true;
        observer.disconnect();
        cleanup();
      }
    };
    preference.addEventListener("change", reduce);
    return () => {
      disposed = true;
      observer.disconnect();
      preference.removeEventListener("change", reduce);
      cleanup();
    };
  }, []);
  return (
    <div className="chrome-mark" ref={host} aria-hidden="true">
      <span>H</span>
    </div>
  );
}
