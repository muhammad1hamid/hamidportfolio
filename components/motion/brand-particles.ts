import { originFont, rasterizeOriginWord } from "./origin-word.js";

const anchorArrival = 240;
const emissionAt = 290;
const lockupAt = 1360;
const lockupDuration = 1000;
const breakupAt = lockupAt + lockupDuration;
const revealAt = breakupAt + 240;
const curtainDuration = 800;
const maxPlaybackRate = 1.16;

const progress = (time: number, start: number, end: number) =>
  Math.min(1, Math.max(0, (time - start) / (end - start)));
const smooth = (value: number) => value * value * (3 - 2 * value);
const out = (value: number) => 1 - (1 - value) ** 3;
const mix = (start: number, end: number, value: number) =>
  start + (end - start) * value;

type WordMask = NonNullable<ReturnType<typeof rasterizeOriginWord>>;
type OriginSession = NonNullable<Window["hamidOrigin"]>;

function createRenderer(
  context: CanvasRenderingContext2D,
  mask: WordMask,
  viewportWidth: number,
  viewportHeight: number,
  ink: string,
  accent: string,
) {
  const { bitmap, dpr, tiles, anchorWidth, anchorCenter } = mask;
  const width = bitmap.width / dpr;
  const height = bitmap.height / dpr;
  const scatter = Math.min(96, viewportWidth * 0.13);
  const canvas = context.canvas;
  canvas.width = Math.floor(Math.min(viewportWidth, width + scatter * 2) * dpr);
  canvas.height = Math.floor(
    Math.min(viewportHeight, height + scatter * 2) * dpr,
  );
  const viewWidth = canvas.width / dpr;
  const viewHeight = canvas.height / dpr;
  canvas.style.width = `${viewWidth}px`;
  canvas.style.height = `${viewHeight}px`;
  context.scale(dpr, dpr);

  const wordX = Math.round(((viewWidth - width) / 2) * dpr) / dpr;
  const wordY = Math.round(((viewHeight - height) / 2) * dpr) / dpr;
  const anchorX = (time: number) =>
    mix(
      viewWidth / 2 - anchorCenter,
      wordX,
      smooth(progress(time, emissionAt, 1180)),
    );
  const sources = tiles.filter((tile) => tile.letter === 0);
  let state = 3178949;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const particles = tiles.map((tile) => {
    const start = emissionAt + (tile.letter - 1) * 84 + random() * 113;
    const source = sources[Math.floor(random() * sources.length)];
    return {
      ...tile,
      start,
      arrival: 918 + (tile.letter - 1) * 96 + random() * 110,
      fromX: anchorX(start) + source.x,
      fromY: source.y,
      arc: (random() - 0.58) * Math.min(88, viewportWidth * 0.12),
      size: (viewportWidth < 700 ? 1 : 1.28) + random() * 1.48,
      warm: random() < 0.28,
      breakStart: breakupAt + random() * 141 + (1 - tile.x / width) * 46,
      breakLength: 570 + random() * 220,
      driftX: scatter * (tile.x / width - 0.5 + random() - 0.5),
      rise: scatter * (0.22 + random() * 0.58),
    };
  });

  return (time: number) => {
    context.clearRect(0, 0, viewWidth, viewHeight);
    if (time < lockupAt) {
      const arrival = out(progress(time, 0, anchorArrival));
      const scale = mix(0.94, 1, arrival);
      context.globalAlpha = arrival;
      context.drawImage(
        bitmap,
        0,
        0,
        anchorWidth,
        bitmap.height,
        anchorX(time) + anchorCenter * (1 - scale),
        wordY + (height * (1 - scale)) / 2,
        (anchorWidth / dpr) * scale,
        height * scale,
      );

      const solid = smooth(progress(time, lockupAt - 55, lockupAt));
      for (const point of particles) {
        if (!point.letter || time <= point.start) continue;
        const flight = progress(time, point.start, point.arrival);
        const travel = smooth(flight);
        const x = mix(point.fromX, wordX + point.x, travel);
        const y =
          wordY +
          mix(point.fromY, point.y, travel) +
          Math.sin(flight * Math.PI) * point.arc;
        context.globalAlpha = progress(flight, 0, 0.15) * (1 - solid);
        context.fillStyle = point.warm && flight < 0.93 ? accent : ink;
        context.fillRect(
          x - point.size / 2,
          y - point.size / 2,
          point.size,
          point.size,
        );
      }
      if (solid > 0) {
        context.globalAlpha = solid;
        context.drawImage(
          bitmap,
          anchorWidth,
          0,
          bitmap.width - anchorWidth,
          bitmap.height,
          wordX + anchorWidth / dpr,
          wordY,
          width - anchorWidth / dpr,
          height,
        );
      }
    } else if (time < breakupAt) {
      context.drawImage(bitmap, wordX, wordY, width, height);
    } else {
      // At zero travel these adjacent cells reconstruct the whole raster.
      // Each piece then moves and shrinks from its own place in the word.
      for (const point of particles) {
        const elapsed = progress(
          time,
          point.breakStart,
          point.breakStart + point.breakLength,
        );
        if (elapsed === 1) continue;
        const drift = out(elapsed);
        const scale = mix(1, 0.12, drift);
        const tileWidth = point.width / dpr;
        const tileHeight = point.height / dpr;
        const x = wordX + point.left / dpr + point.driftX * drift;
        const y = wordY + point.top / dpr - point.rise * drift;
        context.globalAlpha = 1 - smooth(progress(elapsed, 0.28, 1));
        context.drawImage(
          bitmap,
          point.left,
          point.top,
          point.width,
          point.height,
          x + (tileWidth * (1 - scale)) / 2,
          y + (tileHeight * (1 - scale)) / 2,
          tileWidth * scale,
          tileHeight * scale,
        );
      }
    }
    context.globalAlpha = 1;
  };
}

const settle = [
  { scale: "0.975", translate: "0 11px" },
  { scale: "1", translate: "0 0" },
];

function mountBrandParticles(session: OriginSession, stage: HTMLElement) {
  const canvas = stage.querySelector<HTMLCanvasElement>(".origin-particles");
  const curtain = stage.querySelector<HTMLElement>(".origin-curtain");
  const mark = stage.querySelector<HTMLElement>(".origin-placeholder");
  if (!canvas || !curtain || !mark) {
    session.finish();
    return;
  }

  const { signal, duration: total, leadSelector } = session;
  const animations: Animation[] = [];
  let frame = 0;
  let fontTimer = 0;
  let holdTimer = 0;

  signal.addEventListener(
    "abort",
    () => {
      cancelAnimationFrame(frame);
      clearTimeout(fontTimer);
      clearTimeout(holdTimer);
      for (const animation of animations) animation.cancel();
      canvas.width = 1;
      canvas.height = 1;
    },
    { once: true },
  );

  const start = async () => {
    const fontSize = parseFloat(getComputedStyle(mark).fontSize);
    await Promise.race([
      document.fonts.load(originFont(fontSize), "HAMID"),
      new Promise<void>((resolve) => {
        fontTimer = window.setTimeout(resolve, 120);
      }),
    ]);
    clearTimeout(fontTimer);
    if (signal.aborted) return;

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const context = canvas.getContext("2d");
    const styles = getComputedStyle(stage);
    const ink = styles.getPropertyValue("--text").trim();
    const accent = styles.getPropertyValue("--accent").trim();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mask =
      width > 100 && fontSize > 12
        ? rasterizeOriginWord(fontSize, width, dpr, ink)
        : undefined;
    if (!context || !mask || !mask.tiles.some((tile) => tile.letter === 0)) {
      session.finish();
      return;
    }
    const draw = createRenderer(context, mask, width, height, ink, accent);
    if (!session.ready()) return;

    const readyAt = performance.now();
    const elapsed = readyAt - session.startedAt;
    // Spend some of a late start on the stationary H. Cap the catch-up so
    // the letter assembly and hold keep their pace on cold visits.
    const first = Math.min(elapsed, anchorArrival);
    const assemblyRate = Math.min(
      maxPlaybackRate,
      (lockupAt - first) / (lockupAt - elapsed),
    );
    let lockupStartedAt: number | undefined;
    let revealing = false;
    window.addEventListener(
      "resize",
      () => {
        if (
          Math.abs(stage.clientWidth - width) > 12 ||
          Math.abs(stage.clientHeight - height) > 24
        )
          session.finish();
      },
      { passive: true, signal },
    );

    const render = (now: number) => {
      const time =
        lockupStartedAt === undefined
          ? first + (now - readyAt) * assemblyRate
          : lockupAt + (now - lockupStartedAt);
      if (lockupStartedAt === undefined && time >= lockupAt) {
        // Hold the crisp word for a full second from the actual rendered frame.
        lockupStartedAt = now;
        draw(lockupAt);
        holdTimer = window.setTimeout(() => {
          frame = requestAnimationFrame(render);
        }, lockupDuration);
        return;
      }
      if (time >= total) {
        session.finish();
        return;
      }
      draw(time);
      if (!revealing && time >= revealAt) {
        revealing = true;
        document.documentElement.dataset.originIntro = "revealing";
        const duration = Math.min(curtainDuration, total - time);
        animations.push(
          curtain.animate(
            [
              { transform: "translateY(0)" },
              { transform: "translateY(-100%)" },
            ],
            {
              duration,
              easing: "cubic-bezier(.54,.04,.24,1)",
              fill: "forwards",
            },
          ),
        );
        const lead = document.querySelectorAll(
          leadSelector + ", #main .hero-topline",
        );
        const h1 = document.querySelector("#main h1");
        const targets = lead.length ? Array.from(lead) : h1 ? [h1] : [];
        for (const target of targets) {
          animations.push(
            target.animate(settle, {
              duration,
              easing: "cubic-bezier(.22,1,.36,1)",
            }),
          );
        }
        const actions = document.querySelector(".hero-v2 .hero-actions");
        if (actions) {
          animations.push(
            actions.animate([{ translate: "0 6px" }, { translate: "0 0" }], {
              duration: duration * 0.85,
              delay: duration * 0.15,
              easing: "ease-out",
              fill: "backwards",
            }),
          );
        }
      }
      frame = requestAnimationFrame(render);
    };
    render(readyAt);
  };

  void start().catch(() => session.finish());
}

// The standalone entry can arrive while the HTML or stylesheet is still being
// parsed. Start as soon as the static stage is ready without waiting for React.
function startWhenStageReady(session: OriginSession) {
  let pending = 0;
  const findStage = () => {
    if (session.signal.aborted) return;
    const stage = document.getElementById("hamid-origin");
    if (
      stage?.querySelector("#hamid-origin-skip") &&
      getComputedStyle(stage).position === "fixed" &&
      stage.clientWidth
    ) {
      mountBrandParticles(session, stage);
    } else {
      pending = requestAnimationFrame(findStage);
    }
  };
  session.signal.addEventListener(
    "abort",
    () => cancelAnimationFrame(pending),
    { once: true },
  );
  findStage();
}

if (window.hamidOrigin) startWhenStageReady(window.hamidOrigin);
