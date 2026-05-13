"use client";

import {
  Bodies,
  Body,
  Engine,
  Events,
  World,
} from "matter-js";
import { useCallback, useEffect, useRef } from "react";

type BallMachineProps = {
  numbers: number[];
  drawnNumbers: number[];
  activeNumber: number | null;
  selectedNumber: number | null;
  spinVersion: number;
};

const BALL_RADIUS = 28;
const WALL_THICKNESS = 160;
const BASE_SPEED = 5.1;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createBallBody(id: number, x: number, y: number) {
  const body = Bodies.circle(x, y, BALL_RADIUS, {
    label: String(id),
    restitution: 1.01,
    friction: 0,
    frictionAir: 0.0011,
    frictionStatic: 0,
    slop: 0.02,
    density: 0.0011,
    inertia: Infinity,
  });

  const angle = randomBetween(0, Math.PI * 2);
  Body.setVelocity(body, {
    x: Math.cos(angle) * BASE_SPEED,
    y: Math.sin(angle) * BASE_SPEED,
  });
  Body.setAngularVelocity(body, randomBetween(-0.08, 0.08));

  return body;
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  body: Body,
  state: "normal" | "active" | "selected" | "drawn",
) {
  const { x, y } = body.position;
  const ballNumber = Number(body.label);
  const label = body.label.padStart(2, "0");
  const radius = state === "selected" ? 54 : BALL_RADIUS;

  const accent =
    ballNumber <= 19
      ? { light: "#ff9e9e", mid: "#ef4444", dark: "#991b1b" }
      : ballNumber <= 39
        ? { light: "#fff1a6", mid: "#facc15", dark: "#a16207" }
        : ballNumber <= 59
          ? { light: "#ffb5df", mid: "#ec4899", dark: "#9d174d" }
          : ballNumber <= 79
            ? { light: "#b8f7b8", mid: "#22c55e", dark: "#166534" }
            : { light: "#e5b8ff", mid: "#c026d3", dark: "#6b21a8" };

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);

  if (state === "active") {
    const halo = ctx.createRadialGradient(0, 0, radius * 0.6, 0, 0, radius + 18);
    halo.addColorStop(0, "rgba(255,224,120,0.22)");
    halo.addColorStop(0.65, "rgba(255,210,90,0.12)");
    halo.addColorStop(1, "rgba(255,210,90,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 18, 0, Math.PI * 2);
    ctx.fill();
  }

  const gradient = ctx.createRadialGradient(-8, -10, 3, 0, 0, radius);
  if (state === "selected") {
    gradient.addColorStop(0, "#fffef7");
    gradient.addColorStop(0.34, accent.light);
    gradient.addColorStop(0.68, "#ffd85a");
    gradient.addColorStop(1, accent.dark);
  } else if (state === "active") {
    gradient.addColorStop(0, "#fffefb");
    gradient.addColorStop(0.34, accent.light);
    gradient.addColorStop(0.7, accent.mid);
    gradient.addColorStop(1, accent.dark);
  } else {
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.22, "#fbfdff");
    gradient.addColorStop(0.46, accent.light);
    gradient.addColorStop(0.74, accent.mid);
    gradient.addColorStop(1, accent.dark);
  }

  ctx.globalAlpha = state === "drawn" ? 0.22 : 1;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.strokeStyle =
    state === "selected"
      ? "rgba(0,0,0,0.92)"
      : state === "active"
        ? "rgba(0,0,0,0.88)"
        : "rgba(0,0,0,0.78)";
  ctx.lineWidth = state === "selected" ? 3.2 : state === "active" ? 2.8 : 2.4;
  ctx.stroke();

  ctx.strokeStyle =
    state === "selected" || state === "active"
      ? "rgba(255,255,255,0.78)"
      : "rgba(255,255,255,0.72)";
  ctx.lineWidth = state === "selected" ? 2.6 : 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle =
    state === "selected" || state === "active"
      ? "rgba(255,255,255,0.72)"
      : "rgba(255,255,255,0.65)";
  ctx.beginPath();
  ctx.arc(-7, -9, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();

  if (state === "selected") {
    ctx.shadowColor = "rgba(255,212,84,0.78)";
    ctx.shadowBlur = 34;
  } else if (state === "active") {
    ctx.shadowColor = "rgba(255,226,120,0.65)";
    ctx.shadowBlur = 18;
  } else {
    ctx.shadowColor = "rgba(180,220,255,0.34)";
    ctx.shadowBlur = 16;
  }

  ctx.font = `900 ${state === "selected" ? 24 : 18}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111111";
  ctx.shadowColor = "rgba(255,255,255,0.12)";
  ctx.shadowBlur = 4;
  ctx.fillText(label, 0, state === "selected" ? 2 : 1);

  ctx.restore();
}

export default function BallMachine({
  numbers,
  drawnNumbers,
  activeNumber,
  selectedNumber,
  spinVersion,
}: BallMachineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const bodiesRef = useRef<Map<number, Body>>(new Map());
  const wallsRef = useRef<Body[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);
  const previousSpinVersionRef = useRef(0);
  const activeNumberRef = useRef<number | null>(activeNumber);
  const selectedNumberRef = useRef<number | null>(selectedNumber);
  const drawnNumbersRef = useRef<Set<number>>(new Set(drawnNumbers));
  const visibleNumbers = numbers.filter(
    (id) => !drawnNumbers.includes(id) || id === selectedNumber || id === activeNumber,
  );

  const rebuildBodies = useCallback(
    (width: number, height: number) => {
      const engine = engineRef.current;
      if (!engine) return;

      const oldBodies = Array.from(bodiesRef.current.values());
      if (oldBodies.length > 0) {
        World.remove(engine.world, oldBodies);
      }

      bodiesRef.current.clear();

      const spawnCenterX = width * 0.5;
      const spawnCenterY = height * 0.5;
      const spawnRadiusX = Math.min(width * 0.3, 280);
      const spawnRadiusY = Math.min(height * 0.22, 180);

      for (const id of visibleNumbers) {
        const x = Math.min(
          Math.max(spawnCenterX + randomBetween(-spawnRadiusX, spawnRadiusX), BALL_RADIUS),
          width - BALL_RADIUS,
        );
        const y = Math.min(
          Math.max(spawnCenterY + randomBetween(-spawnRadiusY, spawnRadiusY), BALL_RADIUS),
          height - BALL_RADIUS,
        );

        const body = createBallBody(id, x, y);
        bodiesRef.current.set(id, body);
        World.add(engine.world, body);
      }
    },
    [visibleNumbers],
  );

  useEffect(() => {
    activeNumberRef.current = activeNumber;
    selectedNumberRef.current = selectedNumber;
    drawnNumbersRef.current = new Set(drawnNumbers);
  }, [activeNumber, drawnNumbers, selectedNumber]);

  useEffect(() => {
    const engine = Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
      constraintIterations: 2,
      positionIterations: 10,
      velocityIterations: 10,
    });

    engineRef.current = engine;

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!container || !canvas || !engine) return;

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const oldWalls = wallsRef.current;
      if (oldWalls.length > 0) {
        World.remove(engine.world, oldWalls);
      }

      const walls = [
        Bodies.rectangle(width / 2, -WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS, {
          isStatic: true,
          restitution: 1.04,
          friction: 0,
        }),
        Bodies.rectangle(
          width / 2,
          height + WALL_THICKNESS / 2,
          width + WALL_THICKNESS * 2,
          WALL_THICKNESS,
          { isStatic: true, restitution: 1.04, friction: 0 },
        ),
        Bodies.rectangle(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, {
          isStatic: true,
          restitution: 1.04,
          friction: 0,
        }),
        Bodies.rectangle(
          width + WALL_THICKNESS / 2,
          height / 2,
          WALL_THICKNESS,
          height + WALL_THICKNESS * 2,
          { isStatic: true, restitution: 1.04, friction: 0 },
        ),
      ];

      wallsRef.current = walls;
      World.add(engine.world, walls);

      if (bodiesRef.current.size === 0) {
        rebuildBodies(width, height);
      }

      for (const body of bodiesRef.current.values()) {
        Body.setPosition(body, {
          x: Math.min(Math.max(body.position.x, BALL_RADIUS), width - BALL_RADIUS),
          y: Math.min(Math.max(body.position.y, BALL_RADIUS), height - BALL_RADIUS),
        });
      }
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [numbers, rebuildBodies]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const stabilizeAndGuide = () => {
      const container = containerRef.current;
      const width = container?.clientWidth ?? 0;
      const height = container?.clientHeight ?? 0;
      if (!width || !height) return;

      const focusNumber = selectedNumber;
      const selectedBody =
        selectedNumber !== null ? bodiesRef.current.get(selectedNumber) : null;

      for (const body of bodiesRef.current.values()) {
        const hitX = body.position.x <= BALL_RADIUS || body.position.x >= width - BALL_RADIUS;
        const hitY = body.position.y <= BALL_RADIUS || body.position.y >= height - BALL_RADIUS;
        const clampedX = Math.min(Math.max(body.position.x, BALL_RADIUS), width - BALL_RADIUS);
        const clampedY = Math.min(Math.max(body.position.y, BALL_RADIUS), height - BALL_RADIUS);

        if (clampedX !== body.position.x || clampedY !== body.position.y) {
          Body.setPosition(body, { x: clampedX, y: clampedY });
          Body.setVelocity(body, {
            x: body.velocity.x * (hitX ? -1 : 1),
            y: body.velocity.y * (hitY ? -1 : 1),
          });
        }
      }

      if (selectedBody) {
        const target = {
          x: width * 0.5,
          y: height * 0.42,
        };
        const otherBodies = Array.from(bodiesRef.current.entries())
          .filter(([id]) => id !== selectedNumber)
          .sort((a, b) => a[0] - b[0]);
        const sideBodies = Math.ceil(otherBodies.length / 2);
        const topPadding = Math.max(170, Math.floor(height * 0.2));
        const bottomPadding = Math.max(72, Math.floor(height * 0.08));
        const usableHeight = Math.max(120, height - topPadding - bottomPadding);
        const rowSpacing = BALL_RADIUS * 2 + 8;
        const maxRowsPerColumn = Math.max(1, Math.floor(usableHeight / rowSpacing));
        const columnsPerSide = Math.max(1, Math.ceil(sideBodies / maxRowsPerColumn));
        const rowsPerColumn = Math.max(1, Math.ceil(sideBodies / columnsPerSide));
        const startY = Math.max(BALL_RADIUS + 8, topPadding);
        const leftInset = Math.max(84, Math.floor(width * 0.14));
        const rightInset = Math.max(170, Math.floor(width * 0.2));
        const columnSpacing = BALL_RADIUS * 2 + 10;
        const targets = new Map<number, { x: number; y: number }>();

        otherBodies.forEach(([id], bodyIndex) => {
          const goLeft = bodyIndex < sideBodies;
          const sideIndex = goLeft ? bodyIndex : bodyIndex - sideBodies;
          const column = Math.floor(sideIndex / rowsPerColumn);
          const row = sideIndex % rowsPerColumn;

          targets.set(id, {
            x: goLeft
              ? leftInset + column * columnSpacing
              : width - rightInset - column * columnSpacing,
            y: Math.min(
              Math.max(startY + row * rowSpacing, BALL_RADIUS + 8),
              height - BALL_RADIUS - 8,
            ),
          });
        });

        for (const [id, body] of bodiesRef.current) {
          if (id === selectedNumber) {
            if (body.isStatic) {
              Body.setStatic(body, false);
            }

            Body.setVelocity(body, { x: 0, y: 0 });
            Body.setAngularVelocity(body, 0);
            Body.setAngle(body, 0);
            Body.setPosition(body, {
              x: body.position.x + (target.x - body.position.x) * 0.04,
              y: body.position.y + (target.y - body.position.y) * 0.04,
            });
          } else {
            if (body.isStatic) {
              Body.setStatic(body, false);
            }

            const sideTarget = targets.get(id);
            if (!sideTarget) {
              continue;
            }

            Body.setVelocity(body, { x: 0, y: 0 });
            Body.setAngularVelocity(body, 0);
            Body.setAngle(body, 0);
            Body.setPosition(body, {
              x: body.position.x + (sideTarget.x - body.position.x) * 0.12,
              y: body.position.y + (sideTarget.y - body.position.y) * 0.12,
            });
          }
        }

        return;
      }

      for (const body of bodiesRef.current.values()) {
        if (body.isStatic) {
          Body.setStatic(body, false);
        }

        const speed = Math.hypot(body.velocity.x, body.velocity.y);
        if (speed < 0.001) {
          const angle = randomBetween(0, Math.PI * 2);
          Body.setVelocity(body, {
            x: Math.cos(angle) * BASE_SPEED,
            y: Math.sin(angle) * BASE_SPEED,
          });
          continue;
        }

        const scale = BASE_SPEED / speed;
        Body.setVelocity(body, {
          x: body.velocity.x * scale,
          y: body.velocity.y * scale,
        });
      }

      if (focusNumber === null) return;

      const focus = bodiesRef.current.get(focusNumber);
      if (!focus) return;

      for (const [id, body] of bodiesRef.current) {
        if (id === focusNumber) {
          continue;
        }

        const dx = body.position.x - focus.position.x;
        const dy = body.position.y - focus.position.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);

        if (distance < 180) {
          Body.applyForce(body, body.position, {
            x: (dx / distance) * 0.00008,
            y: (dy / distance) * 0.00008,
          });
        }
      }
    };

    Events.on(engine, "beforeUpdate", stabilizeAndGuide);
    return () => {
      Events.off(engine, "beforeUpdate", stabilizeAndGuide);
    };
  }, [selectedNumber]);

  useEffect(() => {
    const container = containerRef.current;
    const engine = engineRef.current;
    if (!container || !engine) return;

    const visibleSet = new Set(visibleNumbers);
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    for (const [id, body] of Array.from(bodiesRef.current.entries())) {
      if (!visibleSet.has(id)) {
        World.remove(engine.world, body);
        bodiesRef.current.delete(id);
      }
    }

    for (const id of visibleNumbers) {
      if (bodiesRef.current.has(id)) {
        continue;
      }

      const body = createBallBody(
        id,
        Math.min(
          Math.max(width * 0.5 + randomBetween(-width * 0.22, width * 0.22), BALL_RADIUS),
          width - BALL_RADIUS,
        ),
        Math.min(
          Math.max(height * 0.5 + randomBetween(-height * 0.18, height * 0.18), BALL_RADIUS),
          height - BALL_RADIUS,
        ),
      );
      bodiesRef.current.set(id, body);
      World.add(engine.world, body);
    }
  }, [visibleNumbers]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (spinVersion === previousSpinVersionRef.current) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    rebuildBodies(width, height);

    previousSpinVersionRef.current = spinVersion;
  }, [rebuildBodies, spinVersion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const engine = engineRef.current;
    if (!canvas || !container) return;
    if (!engine) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fixedStep = 1000 / 120;
    const maxFrameDelta = 32;
    const maxStepsPerFrame = 3;

    const render = (timestamp: number) => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const previousTimestamp = lastFrameTimeRef.current ?? timestamp;
      const frameDelta = Math.min(timestamp - previousTimestamp, maxFrameDelta);

      lastFrameTimeRef.current = timestamp;
      accumulatedTimeRef.current += frameDelta;

      let steps = 0;
      while (accumulatedTimeRef.current >= fixedStep && steps < maxStepsPerFrame) {
        Engine.update(engine, fixedStep);
        accumulatedTimeRef.current -= fixedStep;
        steps += 1;
      }

      if (steps === maxStepsPerFrame) {
        accumulatedTimeRef.current = 0;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const overlay = ctx.createLinearGradient(0, 0, 0, height);
      overlay.addColorStop(0, "rgba(5,9,15,0.18)");
      overlay.addColorStop(0.5, "rgba(10,14,20,0.1)");
      overlay.addColorStop(1, "rgba(5,9,15,0.22)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.65,
      );
      vignette.addColorStop(0, "rgba(255,255,255,0.08)");
      vignette.addColorStop(0.52, "rgba(255,255,255,0.02)");
      vignette.addColorStop(1, "rgba(0,0,0,0.16)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, width - 36, height - 36);

      const normalBodies: Array<{ body: Body; state: "normal" | "drawn" }> = [];
      let activeBody: Body | null = null;
      let selectedBody: Body | null = null;

      for (const [id, body] of bodiesRef.current) {
        if (id === selectedNumberRef.current) {
          selectedBody = body;
          continue;
        }

        if (id === activeNumberRef.current) {
          activeBody = body;
          continue;
        }

        normalBodies.push({
          body,
          state: drawnNumbersRef.current.has(id) ? "drawn" : "normal",
        });
      }

      for (const { body, state } of normalBodies) {
        drawBall(ctx, body, state);
      }

      if (activeBody) {
        drawBall(ctx, activeBody, "active");
      }

      if (selectedBody) {
        drawBall(ctx, selectedBody, "selected");
      }

      frameRef.current = requestAnimationFrame(render);
    };

    lastFrameTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = null;
      lastFrameTimeRef.current = null;
      accumulatedTimeRef.current = 0;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-screen w-full overflow-hidden bg-[url('/fondo-bolas.webp')] bg-cover bg-center bg-no-repeat"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
