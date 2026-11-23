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
import { walkLength } from "./geometry";
import "@/app/curve.css";
import gsap from "gsap";

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
  const targetProgress = useRef(0);
  const restoringFocus = useRef(false);
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
  const replayTween = useRef<gsap.core.Tween | null>(null);

  function send(event: CurveEvent) {
    const next = nextMode(modeRef.current, event);
    modeRef.current = next;
    setMode(next);
    return next;
  }
  function fallback(message = "") {
    replayTween.current?.kill();
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
      replayTween.current?.kill();
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
      .then(async ({ createCorridor }) => {
        await document.fonts.ready;
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
          onResize: setRect,
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
            (corridorProjects[hashProject].distance - 7) / walkLength,
          );
          walk(position);
          instance.setProgress(position, true);
          historyReplay.current = true;
          selectRef.current(hashProject);
        }
      })
      .catch(() => {
        if (!disposed)
          fallback(
            "The project gallery is ready. 3D could not start in this browser.",
          );
      });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      scene.current?.dispose();
      scene.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !region.current) return;
    const root = document.documentElement;
    root.setAttribute("data-curve-immersive", "");
    root.dataset.curveNav = "shown";
    window.scrollTo({ top: 0, behavior: "instant" });
    const element = region.current;
    const abort = new AbortController();
    document.querySelector(".navigation")?.addEventListener(
      "focusin",
      () => {
        if (modeRef.current === "WALK") root.dataset.curveNav = "shown";
      },
      { signal: abort.signal },
    );
    let sum = 0,
      direction = 0,
      lastInput = 0;
    const move = (delta: number, touch = false) => {
      if (modeRef.current !== "WALK") return;
      replayTween.current?.kill();
      const now = performance.now(),
        sign = Math.sign(delta);
      if (!sign) return;
      if (direction !== sign || now - lastInput > 220) sum = 0;
      direction = sign;
      lastInput = now;
      sum += Math.abs(delta);
      walk(targetProgress.current + delta / (touch ? 4600 : 12000));
      if (targetProgress.current < 0.005) root.dataset.curveNav = "shown";
      else if (sum > (touch ? 18 : 36))
        root.dataset.curveNav = sign > 0 ? "hidden" : "shown";
    };
    element.addEventListener(
      "wheel",
      (event) => {
        if (event.ctrlKey) return;
        event.preventDefault();
        const unit =
          event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
        move(Math.max(-1400, Math.min(1400, event.deltaY * unit)));
      },
      { passive: false, signal: abort.signal },
    );
    let touch: { x: number; y: number } | null = null;
    element.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "touch")
          touch = { x: event.clientX, y: event.clientY };
      },
      { signal: abort.signal },
    );
    element.addEventListener(
      "pointermove",
      (event) => {
        if (!touch || event.pointerType !== "touch") return;
        const delta = touch.y - event.clientY;
        if (Math.abs(delta) > Math.abs(touch.x - event.clientX))
          move(delta, true);
        touch = { x: event.clientX, y: event.clientY };
      },
      { passive: true, signal: abort.signal },
    );
    const release = () => {
      touch = null;
    };
    element.addEventListener("pointerup", release, { signal: abort.signal });
    element.addEventListener("pointercancel", release, {
      signal: abort.signal,
    });
    window.addEventListener(
      "keydown",
      (event) => {
        if (
          modeRef.current !== "WALK" ||
          document.querySelector("dialog[open]") ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        )
          return;
        if (
          event.target instanceof Element &&
          event.target.closest("input,textarea,select,[contenteditable=true]")
        )
          return;
        const delta = {
          ArrowDown: 560,
          ArrowRight: 560,
          PageDown: 1300,
          ArrowUp: -560,
          ArrowLeft: -560,
          PageUp: -1300,
        }[event.key];
        if (delta) {
          event.preventDefault();
          move(delta);
        }
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          replayTween.current?.kill();
          root.dataset.curveNav = event.key === "Home" ? "shown" : "hidden";
          walk(event.key === "Home" ? 0 : 1);
        }
      },
      { signal: abort.signal },
    );
    return () => {
      abort.abort();
      root.removeAttribute("data-curve-immersive");
      root.removeAttribute("data-curve-nav");
    };
  }, [enabled]);

  function getScrollProgress() {
    return targetProgress.current;
  }
  function walk(value: number) {
    targetProgress.current = Math.max(0, Math.min(1, value));
    scene.current?.setProgress(targetProgress.current);
    if (targetProgress.current === 0)
      document.documentElement.dataset.curveNav = "shown";
  }
  function select(index: number) {
    if (modeRef.current !== "WALK" || !scene.current) return;
    replayTween.current?.kill();
    // Save the rendered position, including trackpad damping still settling.
    walk(scene.current.getProgress());
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
  function exploreAgain() {
    if (modeRef.current !== "WALK") return;
    replayTween.current?.kill();
    const value = { progress: scene.current?.getProgress() ?? progress };
    document.documentElement.dataset.curveNav = "shown";
    replayTween.current = gsap.to(value, {
      progress: 0,
      duration: 2.8,
      ease: "power2.inOut",
      onUpdate: () => walk(value.progress),
    });
  }
  function returnToWall() {
    const returningIndex = selectedRef.current;
    scene.current?.returnToWall(() => {
      send("WALL_RETURNED");
      dialog.current?.close();
      setSelected(null);
      selectedRef.current = null;
      send("RESTORED");
      const trigger = origin.current?.matches(
        `.curve-frame-control[data-project-index="${returningIndex}"]`,
      )
        ? origin.current
        : region.current?.querySelector<HTMLButtonElement>(
            `.curve-frame-control[data-project-index="${returningIndex}"]`,
          );
      restoringFocus.current = true;
      if (trigger?.isConnected && trigger !== document.body)
        trigger.focus({ preventScroll: true });
      else
        region.current
          ?.querySelector<HTMLButtonElement>(".curve-frame-controls button")
          ?.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        restoringFocus.current = false;
        const requested = corridorProjects.findIndex(
          (item) => `#project=${item.slug}` === location.hash,
        );
        if (
          mounted.current &&
          requested >= 0 &&
          modeRef.current === "WALK" &&
          scene.current
        ) {
          const saved = history.state?.hamidCurve?.progress;
          if (typeof saved === "number") {
            walk(saved);
            scene.current.setProgress(saved, true);
          }
          historyReplay.current = true;
          selectRef.current(requested);
        }
      });
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
            <div className="curve-tools">
              <button
                className="curve-nav-reveal"
                onClick={() => {
                  document.documentElement.dataset.curveNav = "shown";
                  document
                    .querySelector<HTMLAnchorElement>(".navigation a")
                    ?.focus({ preventScroll: true });
                }}
              >
                Navigation
              </button>
              <button className="curve-list-toggle" onClick={() => fallback()}>
                List view
              </button>
            </div>
            <div
              className="curve-frame-controls"
              aria-label="Nearby project frames"
            >
              {nearby.map((index) => (
                <button
                  key={index}
                  data-project-index={index}
                  className="curve-frame-control"
                  onFocus={() => {
                    if (!restoringFocus.current) select(index);
                  }}
                  onClick={() => select(index)}
                >
                  Preview {corridorProjects[index].title}
                </button>
              ))}
            </div>
            <div className="curve-hud">
              <div>
                <span className="curve-counter">
                  {String((nearby[0] ?? 17) + 1).padStart(2, "0")} / 18
                </span>
                <p className="curve-hint">
                  {progress > 0.96
                    ? "Scroll back or explore again"
                    : progress < 0.03
                      ? "Scroll or swipe to walk"
                      : "Select a frame to explore"}
                </p>
              </div>
              <div className="curve-walk-buttons">
                <button
                  aria-label="Walk backward"
                  onClick={() => {
                    replayTween.current?.kill();
                    document.documentElement.dataset.curveNav = "shown";
                    walk(Math.max(0, progress - 0.07));
                  }}
                >
                  ←
                </button>
                <button
                  aria-label="Walk forward"
                  onClick={() => {
                    replayTween.current?.kill();
                    document.documentElement.dataset.curveNav = "hidden";
                    walk(Math.min(1, progress + 0.07));
                  }}
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
              <div
                className="curve-end-controls"
                aria-label="The Convergence, final installation"
              >
                <a
                  className="button button-accent"
                  href="/contact/?source=work"
                >
                  Discuss a project
                </a>
                <button onClick={exploreAgain}>Explore again</button>
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
              style={{ top: rect.y + rect.height + 22 }}
            >
              <h2 className="curve-sr-only" id="curve-preview-title">
                {project.title}
              </h2>
              <div>
                <button
                  ref={openButton}
                  className="button button-light"
                  onClick={() => openDetail()}
                  disabled={mode !== "PREVIEW"}
                >
                  View Project
                </button>
                {project.detailUrl ? (
                  <a className="curve-read-more" href={project.detailUrl}>
                    Read More About This Project
                  </a>
                ) : (
                  <button
                    className="curve-read-more"
                    onClick={() => openDetail()}
                    disabled={mode !== "PREVIEW"}
                  >
                    Read More About This Project
                  </button>
                )}
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
