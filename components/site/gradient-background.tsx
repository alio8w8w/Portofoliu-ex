"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Global background: a slow, liquid "lava" of orange, purple, pink and blue with deep dark pools,
 * like the fluid-gradient posters in public/desig-references. Rendered by a tiny WebGL shader
 * (domain-warped noise) at half resolution, ~30 fps, paused when the tab is hidden.
 * Falls back to a static CSS gradient without WebGL; renders a single still frame for
 * prefers-reduced-motion.
 */
const VERT = `attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  float t = u_time * 0.045;

  // domain warping: the noise is pushed around by itself, which gives the liquid, marbled flow
  vec2 q = vec2(fbm(p * 0.8 + vec2(0.0, t)), fbm(p * 0.8 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 0.8 + 2.7 * q + vec2(1.7, 9.2) + 0.7 * t), fbm(p * 0.8 + 2.7 * q + vec2(8.3, 2.8) - 0.6 * t));
  float f = fbm(p * 0.8 + 2.9 * r);

  vec3 deep   = vec3(0.020, 0.012, 0.040);
  vec3 purple = vec3(0.420, 0.200, 0.950);
  vec3 blue   = vec3(0.150, 0.300, 1.000);
  vec3 pink   = vec3(1.000, 0.360, 0.640);
  vec3 orange = vec3(1.000, 0.490, 0.050);
  vec3 gold   = vec3(1.000, 0.700, 0.220);

  // stretch the noise to the full 0..1 range so every colour band is reached
  float g = clamp((f - 0.30) / 0.36, 0.0, 1.0);
  vec3 col = mix(deep, purple, smoothstep(0.08, 0.42, g));
  col = mix(col, blue, smoothstep(0.40, 0.72, r.y) * smoothstep(0.15, 0.45, g) * 0.9);
  col = mix(col, pink, smoothstep(0.38, 0.62, g) * smoothstep(0.38, 0.60, q.x));
  col = mix(col, orange, smoothstep(0.55, 0.82, g + 0.3 * (r.x - 0.5)));
  col = mix(col, gold, smoothstep(0.86, 1.0, g + 0.3 * (r.x - 0.5)) * 0.55);

  // keep deep dark pools between the colours
  col *= mix(0.07, 1.0, smoothstep(0.0, 0.28, g));
  // soft vignette
  vec2 uv = gl_FragCoord.xy / u_res - 0.5;
  col *= 1.0 - smoothstep(0.30, 0.85, length(uv)) * 0.55;

  gl_FragColor = vec4(col, 1.0);
}`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader error")
  return shader
}

export function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" })
    if (!gl) { setFallback(true); return }

    let program: WebGLProgram
    try {
      program = gl.createProgram()!
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link error")
    } catch {
      setFallback(true)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, "a_pos")
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(program, "u_res")
    const uTime = gl.getUniformLocation(program, "u_time")

    const SCALE = 0.5
    const resize = () => {
      const w = Math.max(1, Math.round(window.innerWidth * SCALE))
      const h = Math.max(1, Math.round(window.innerHeight * SCALE))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
    }
    resize()

    // start somewhere different each visit
    const offset = 30 + Math.random() * 200
    const draw = (seconds: number) => {
      gl.uniform1f(uTime, offset + seconds)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    let last = 0
    const start = performance.now()
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      draw((now - start) / 1000)
    }
    if (reduce) draw(0)
    else frame = requestAnimationFrame(loop)

    const onResize = () => { resize(); if (reduce) draw(0) }
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", onResize)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050507]">
      {fallback ? <div className="lava-fallback absolute inset-0" /> : <canvas ref={canvasRef} className="absolute inset-0 size-full" />}
      {/* a light dark veil keeps text readable on the brightest parts */}
      <div className="absolute inset-0 bg-[rgb(5_5_7/16%)]" />
    </div>
  )
}
