"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { corridorProjects } from "./projects";
import { nextMode, type CurveEvent, type CurveMode } from "./machine";
import type { CorridorScene } from "./scene";
import { CaseStudy, type StoryHandle } from "./CaseStudy";
import type { CoverRect } from "./geometry";
import "@/app/curve.css";

export function CurveExperience({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [mode, setMode] = useState<CurveMode>("FALLBACK");
  const [nearby, setNearby] = useState<number[]>([0, 1]);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [coverSource, setCoverSource] = useState("");
  const [rect, setRect] = useState<CoverRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const modeRef = useRef<CurveMode>("FALLBACK");
  const host = useRef<HTMLDivElement>(null);
  const region = useRef<HTMLElement>(null);
  const scene = useRef<CorridorScene | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const savedScroll = useRef(0);
  const origin = useRef<HTMLElement | null>(null);
  const selectRef = useRef<(index: number) => void>(() => {});
  const dismissRef = useRef<() => void>(() => {});
  const story = useRef<StoryHandle>(null);
  const selectedRef = useRef<number | null>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const historyClosePending = useRef(false);
  const historyReplay = useRef(false);
  const mounted = useRef(true);
  const transitionGeneration = useRef(0);

  function send(event: CurveEvent) {
    const next = nextMode(modeRef.current, event);
    modeRef.current = next;
    setMode(next);
    return next;
  }
  function fallback(message = "") {
    transitionGeneration.current++;
    scene.current?.dispose();
    scene.current = null;
    dialog.current?.close();
    setSelected(null);
    selectedRef.current = null;
    setDetailVisible(false);
    send("MODE_SWITCH");
    setEnabled(false);
    setNotice(message);
    try {
      sessionStorage.setItem("hamid-work-view", "list");
    } catch {
      /* Optional preference. */
    }
    if (location.hash.startsWith("#project="))
      history.replaceState(
        { ...history.state, hamidCurve: undefined },
        "",
        location.pathname + location.search,
      );
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useLayoutEffect(() => {
    setClientReady(true);
    const motion = matchMedia(
      "(prefers-reduced-motion: reduce), (forced-colors: active)",
    );
    const parameters = new URLSearchParams(location.search);
    let saved = "";
    try {
      saved = sessionStorage.getItem("hamid-work-view") || "";
    } catch {
      /* Optional preference. */
    }
    const capabilities = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const constrained =
      (capabilities.deviceMemory ?? 8) <= 1 ||
      capabilities.connection?.saveData;
    const requested =
      parameters.get("view") !== "list" &&
      (parameters.get("curve") === "1" || saved !== "list");
    if (requested && !motion.matches && !constrained) {
      send("RETRY");
      setEnabled(true);
    }
    const update = () => {
      if (motion.matches) fallback();
    };
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    mounted.current = true;
    const updateRect = () => {
      requestAnimationFrame(() => {
        if (scene.current)
          setRect(
            scene.current.rect(
              ["DETAIL", "DETAIL_OPENING", "DETAIL_CLOSING"].includes(
                modeRef.current,
              ),
            ),
          );
      });
    };
    const pop = () => {
      historyClosePending.current = false;
      if (!location.hash.startsWith("#project=")) {
        dismissRef.current();
        return;
      }
      const index = corridorProjects.findIndex(
        (project) => `#project=${project.slug}` === location.hash,
      );
      if (index >= 0 && modeRef.current === "WALK") {
        const state = history.state?.hamidCurve;
        if (state) {
          walk(state.progress);
          scene.current?.setProgress(state.progress, true);
        }
        historyReplay.current = true;
        selectRef.current(index);
      }
    };
    const wheel = (event: WheelEvent) => {
      if (modeRef.current !== "DETAIL" && !event.ctrlKey)
        event.preventDefault();
    };
    const layer = dialog.current;
    layer?.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("popstate", pop);
    window.addEventListener("resize", updateRect);
    return () => {
      mounted.current = false;
      transitionGeneration.current++;
      layer?.removeEventListener("wheel", wheel);
      window.removeEventListener("popstate", pop);
      window.removeEventListener("resize", updateRect);
    };
  }, []);
  useEffect(() => {
    if (mode === "PREVIEW") openButton.current?.focus({ preventScroll: true });
    if (mode === "DETAIL")
      dialog.current
        ?.querySelector<HTMLButtonElement>(".curve-story-close")
        ?.focus({ preventScroll: true });
  }, [mode]);
  useEffect(() => {
    if (!enabled || !host.current) return;
    let disposed = false;
    const timeout = window.setTimeout(
      () =>
        fallback(
          "The project gallery is ready while the 3D view is taking longer to load.",
        ),
      10000,
    );
    import("./scene")
      .then(({ createCorridor }) => {
        clearTimeout(timeout);
        if (disposed || !host.current) return;
        const instance = createCorridor({
          host: host.current,
          projects: corridorProjects,
          onProgress: (p, n) => {
            setProgress(p);
            setNearby(n);
          },
          onSelect: (index) => selectRef.current(index),
          onFailure: fallback,
        });
        scene.current = instance;
        send("SCENE_READY");
        if (process.env.NODE_ENV !== "production")
          Object.assign(window, { curveDebug: instance });
        instance.setProgress(getScrollProgress(), true);
        const hashProject = corridorProjects.findIndex(
          (project) => `#project=${project.slug}` === location.hash,
        );
        if (hashProject >= 0) {
          const position = Math.max(
            0,
            (corridorProjects[hashProject].distance - 8) / 77,
          );
          walk(position);
          instance.setProgress(position, true);
          historyReplay.current = true;
          selectRef.current(hashProject);
        }
      })
      .catch(() =>
        fallback(
          "The project gallery is ready. 3D could not start in this browser.",
        ),
      );
    const scroll = () => {
      if (modeRef.current === "WALK")
        scene.current?.setProgress(getScrollProgress());
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      window.removeEventListener("scroll", scroll);
      scene.current?.dispose();
      scene.current = null;
    };
  }, [enabled]);

  function getScrollProgress() {
    const el = region.current;
    if (!el) return 0;
    return Math.max(
      0,
      Math.min(
        1,
        -el.getBoundingClientRect().top /
          (el.offsetHeight - (host.current?.clientHeight || innerHeight)),
      ),
    );
  }
  function walk(value: number) {
    if (!region.current) return;
    const top = region.current.getBoundingClientRect().top + scrollY;
    window.scrollTo({
      top:
        top +
        value *
          (region.current.offsetHeight -
            (host.current?.clientHeight || innerHeight)),
      behavior: "instant",
    });
  }
  function select(index: number) {
    if (modeRef.current !== "WALK" || !scene.current) return;
    // Freeze the native scroll coordinate at the rendered camera position,
    // including selections made while trackpad damping is still settling.
    walk(scene.current.getProgress());
    savedScroll.current = scrollY;
    origin.current = document.activeElement as HTMLElement;
    selectedRef.current = index;
    setSelected(index);
    send("FRAME_ACTIVATE");
    dialog.current?.showModal();
    scene.current.focus(index, () => {
      send("FOCUS_READY");
      setRect(scene.current!.rect());
      if (historyReplay.current) {
        historyReplay.current = false;
        openDetail(false);
      }
    });
  }
  selectRef.current = select;
  function returnToWall() {
    scene.current?.returnToWall(() => {
      send("WALL_RETURNED");
      dialog.current?.close();
      setSelected(null);
      selectedRef.current = null;
      window.scrollTo({ top: savedScroll.current, behavior: "instant" });
      send("RESTORED");
      const trigger = origin.current;
      if (trigger?.isConnected && trigger !== document.body)
        trigger.focus({ preventScroll: true });
      else
        region.current
          ?.querySelector<HTMLButtonElement>(".curve-nearby button")
          ?.focus({ preventScroll: true });
    });
  }
  function openDetail(push = true) {
    if (
      modeRef.current !== "PREVIEW" ||
      !scene.current ||
      selectedRef.current === null
    )
      return;
    send("DETAIL_OPEN");
    historyClosePending.current = false;
    const project = corridorProjects[selectedRef.current];
    if (push)
      history.pushState(
        {
          ...history.state,
          hamidCurve: { id: project.id, progress: scene.current.getProgress() },
        },
        "",
        `#project=${project.slug}`,
      );
    setRect(scene.current.rect(true));
    scene.current.expand(() => {
      setCoverSource(scene.current!.coverSource());
      setDetailVisible(true);
      send("DETAIL_READY");
      requestAnimationFrame(() => {
        if (modeRef.current === "DETAIL") scene.current?.setCovered(true);
      });
    });
  }
  async function closeDetail() {
    if (!["DETAIL", "DETAIL_OPENING"].includes(modeRef.current)) return;
    send("DETAIL_CLOSE");
    const generation = ++transitionGeneration.current;
    await story.current?.returnToCover();
    if (!mounted.current || generation !== transitionGeneration.current) return;
    scene.current?.setCovered(false);
    setDetailVisible(false);
    scene.current?.contract(() => {
      send("COVER_RETURNED");
      returnToWall();
    });
  }
  function dismiss() {
    if (["DETAIL", "DETAIL_OPENING"].includes(modeRef.current)) {
      if (historyClosePending.current) return;
      if (history.state?.hamidCurve && location.hash.startsWith("#project=")) {
        historyClosePending.current = true;
        history.back();
      } else {
        if (location.hash.startsWith("#project="))
          history.replaceState(
            history.state,
            "",
            location.pathname + location.search,
          );
        void closeDetail();
      }
      return;
    }
    if (!["PREVIEW", "PREVIEW_OPENING"].includes(modeRef.current)) return;
    send("PREVIEW_DISMISS");
    returnToWall();
  }
  dismissRef.current = () => {
    if (["DETAIL", "DETAIL_OPENING"].includes(modeRef.current))
      void closeDetail();
    else dismiss();
  };
  const project = selected === null ? null : corridorProjects[selected];
  return (
    <div
      className="curve-experience"
      data-mode={mode}
      data-client-ready={clientReady ? "" : undefined}
    >
      {!clientReady && (
        <div className="curve-starting" aria-live="polite">
          Preparing the gallery…
        </div>
      )}
      {enabled && (
        <section
          ref={region}
          className="curve-walk"
          aria-label="Immersive project corridor"
        >
          <div className="curve-stage">
            <div className="curve-canvas" ref={host} />
            <div className="curve-heading" data-walking={progress > 0.02}>
              <span>WORK / THE CURVE</span>
              <h1>
                <span className="curve-sr-only">Work — The Curve. </span>A walk
                through
                <br />
                <em>the work.</em>
              </h1>
            </div>
            <button className="curve-list-toggle" onClick={() => fallback()}>
              List view
            </button>
            <div className="curve-hud">
              <div>
                <span className="curve-counter">
                  {String((nearby[0] ?? 17) + 1).padStart(2, "0")} / 18
                </span>
                <p className="curve-hint">
                  {progress < 0.03
                    ? "Scroll or swipe to walk"
                    : "Select a frame to explore"}
                </p>
              </div>
              <div className="curve-nearby" aria-label="Nearby projects">
                {(["left", "right"] as const).map((side) => {
                  const index = nearby.find(
                    (candidate) =>
                      corridorProjects[candidate].wallSide === side,
                  );
                  return index === undefined ? (
                    <span key={side} aria-hidden="true" />
                  ) : (
                    <button
                      key={side}
                      onClick={() => select(index)}
                      aria-label={`Preview ${corridorProjects[index].title}, ${side} wall`}
                    >
                      <span className="curve-nearby-title">
                        {corridorProjects[index].title}
                      </span>
                      <span>Preview</span>
                    </button>
                  );
                })}
              </div>
              <div className="curve-walk-buttons">
                <button
                  aria-label="Walk backward"
                  onClick={() => walk(Math.max(0, progress - 0.07))}
                >
                  ←
                </button>
                <button
                  aria-label="Walk forward"
                  onClick={() => walk(Math.min(1, progress + 0.07))}
                >
                  →
                </button>
              </div>
            </div>
            {mode === "INITIALIZING" && (
              <p className="curve-loading" role="status">
                Preparing the gallery…
              </p>
            )}
            {progress > 0.96 && (
              <div className="curve-end">
                <span>THE NEXT CHAPTER</span>
                <h2>
                  Something
                  <br />
                  <em>of your own.</em>
                </h2>
                <a className="button button-light" href="/contact/?source=work">
                  Discuss a project
                </a>
                <button onClick={() => walk(0)}>Walk back to the start</button>
              </div>
            )}
          </div>
        </section>
      )}
      <div hidden={enabled} className="curve-gallery">
        {clientReady && (
          <div className="curve-gallery-control wrap">
            <button
              onClick={() => {
                if (
                  matchMedia(
                    "(prefers-reduced-motion: reduce), (forced-colors: active)",
                  ).matches
                ) {
                  setNotice(
                    "Your display preferences use the gallery for comfortable browsing.",
                  );
                  return;
                }
                send("RETRY");
                try {
                  sessionStorage.setItem("hamid-work-view", "curve");
                } catch {
                  /* Optional preference. */
                }
                setEnabled(true);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            >
              Enter the 3D corridor
            </button>
            {notice && <p role="status">{notice}</p>}
          </div>
        )}
        {children}
      </div>
      <dialog
        ref={dialog}
        className="curve-dialog"
        data-detail={detailVisible}
        data-lenis-prevent
        aria-label={
          project ? `${project.title} project preview` : "Project preview"
        }
        onCancel={(e) => {
          e.preventDefault();
          dismiss();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && mode === "PREVIEW")
            dismiss();
        }}
      >
        {project && !detailVisible && (
          <>
            <button className="curve-preview-list" onClick={() => fallback()}>
              List view
            </button>
            <button
              className="curve-preview-close"
              onClick={dismiss}
              aria-label="Close preview"
              disabled={[
                "PREVIEW_CLOSING",
                "DETAIL_CLOSING",
                "RETURNING",
              ].includes(mode)}
            >
              Back <span aria-hidden="true">×</span>
            </button>
            {mode === "PREVIEW" && (
              <button
                className="curve-cover-hit"
                style={{
                  left: rect.x,
                  top: rect.y,
                  width: rect.width,
                  height: rect.height,
                }}
                aria-label={`Open ${project.title}`}
                onClick={() => openDetail()}
              />
            )}
            <div
              className="curve-preview-info"
              data-visible={mode === "PREVIEW"}
            >
              <p>
                {project.industry} · {project.typeLabel}
              </p>
              <h2 id="curve-preview-title">{project.title}</h2>
              <p>{project.description}</p>
              <div>
                <button
                  ref={openButton}
                  className="button button-light"
                  onClick={() => openDetail()}
                  disabled={mode !== "PREVIEW"}
                >
                  View project
                </button>
                <button className="curve-back" onClick={dismiss}>
                  Back to corridor
                </button>
              </div>
            </div>
          </>
        )}
        {project && detailVisible && (
          <CaseStudy
            ref={story}
            project={project}
            rect={rect}
            closing={mode === "DETAIL_CLOSING"}
            close={dismiss}
            listView={() => fallback()}
            coverSource={coverSource}
          />
        )}
      </dialog>
    </div>
  );
}
