"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 uv = (st - 0.5) * aspect;

    vec2 mouseNorm = (u_mouse / u_resolution - 0.5) * aspect;
    float mouseDist = length(uv - mouseNorm);
    float mouseGlow = smoothstep(0.4, 0.0, mouseDist) * 0.15;

    vec3 baseBg = vec3(0.035, 0.055, 0.038);
    vec3 deepDark = vec3(0.015, 0.025, 0.018);

    float t = u_time * 0.25;
    float n1 = snoise(uv * 1.5 + vec2(t * 0.2, t * 0.1));
    float n2 = snoise(uv * 2.8 - vec2(t * 0.15, -t * 0.25));
    float glow = smoothstep(-0.2, 0.8, n1 * 0.6 + n2 * 0.4);

    vec3 emeraldAccent = vec3(0.06, 0.45, 0.22);
    vec3 limeHighlight = vec3(0.35, 0.85, 0.35);

    vec3 col = mix(deepDark, baseBg, uv.y + 0.5);
    col += emeraldAccent * glow * 0.22;
    col += limeHighlight * mouseGlow;

    vec2 gridSpacing = vec2(38.0);
    vec2 gridPos = mod(gl_FragCoord.xy, gridSpacing);
    vec2 cellCenter = gridSpacing * 0.5;
    float distToDot = length(gridPos - cellCenter);

    float wave = sin(length(uv) * 4.0 - u_time * 1.2) * 0.5 + 0.5;
    float dotBrightness = 0.12 + 0.22 * wave;

    float dotRadius = 1.35;
    float dotMask = 1.0 - smoothstep(dotRadius - 0.5, dotRadius + 0.5, distToDot);

    float dotFlicker = snoise(floor(gl_FragCoord.xy / gridSpacing) * 0.4 + vec2(u_time * 0.4, 0.0));
    float activeDot = step(0.65, dotFlicker);

    vec3 dotColor = mix(vec3(0.18, 0.28, 0.20), vec3(0.35, 0.95, 0.45), activeDot * 0.75);
    col = mix(col, dotColor, dotMask * (dotBrightness + activeDot * 0.4));

    float railX = 32.0;
    float distToRail = abs(gl_FragCoord.x - railX);
    if (distToRail < 8.0) {
        float railY = mod(gl_FragCoord.y - u_time * 60.0, 36.0);
        float railDot = 1.0 - smoothstep(1.2, 2.4, length(vec2(distToRail, railY - 18.0)));
        col += vec3(0.2, 0.95, 0.35) * railDot * 0.85;
    }

    gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    // Cap the buffer on high-DPI screens: this shader is fragment-bound, so a
    // full 3x retina buffer costs ~9x the fragment work for no visible gain.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function syncSize() {
      if (!canvas || !gl) return;
      const w = Math.floor((canvas.clientWidth || 1280) * dpr);
      const h = Math.floor((canvas.clientHeight || 720) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    function onMouseMove(event: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncSize)
        : null;
    ro?.observe(canvas);

    // Pause when scrolled out of view so the page costs nothing further down.
    let visible = true;
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
              if (visible && frame === 0) frame = requestAnimationFrame(render);
            },
            { threshold: 0 },
          )
        : null;
    io?.observe(canvas);

    let frame = 0;
    function render(t: number) {
      if (!gl || !canvas) return;
      if (!visible) {
        frame = 0;
        return;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMouseMove);
      ro?.disconnect();
      io?.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      // Deliberately NOT calling loseContext(): it kills the context for
      // good, and React re-runs effects on every remount (twice in Strict
      // Mode). The second mount would get a dead canvas and render nothing,
      // which showed as a white hero after navigating back to this page.
      // Deleting the GL objects above is enough; the browser reclaims the
      // context when the canvas is garbage collected.
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        // The shader bails out on any WebGL failure — no context, a driver
        // that refuses to compile, a blocked GPU. Without a colour here the
        // canvas is transparent and the page behind shows through, which
        // renders the dark hero white.
        backgroundColor: "var(--color-c-canvas-deep)",
      }}
    />
  );
}
