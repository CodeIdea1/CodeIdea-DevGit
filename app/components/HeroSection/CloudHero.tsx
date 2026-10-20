"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroSection.module.css";

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_mouse;
uniform float u_radius;
uniform float u_time;
varying vec2 v_uv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

void main(){
  vec2 uv = v_uv;
  vec2 diff = uv - u_mouse;
  diff.x *= 2.5;
  float dist = length(diff);
  float influence = smoothstep(u_radius, 0.0, dist);

  float noise = rand(uv + u_time * 0.1);
  float angle = noise * 6.2831;
  float scatter = influence * 0.06 * (0.5 + noise * 0.5);

  uv += vec2(cos(angle), sin(angle)) * scatter;

  vec4 color = texture2D(u_tex, uv);
  color.a *= 1.0 - influence * 0.85 * smoothstep(0.0, u_radius * 0.4, u_radius - dist);

  gl_FragColor = color;
}`;

export default function CloudHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -1.0, y: -1.0 });
  const target    = useRef({ x: -1.0, y: -1.0 });
  const radius    = useRef(0.0);
  const targetR   = useRef(0.0);
  const timeRef   = useRef(0.0);
  const rafRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true })!;
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uMouse  = gl.getUniformLocation(prog, "u_mouse");
    const uRadius = gl.getUniformLocation(prog, "u_radius");
    const uTime   = gl.getUniformLocation(prog, "u_time");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "/hero-back-9.webp";
    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      const render = () => {
        timeRef.current += 0.016;
        mouse.current.x += (target.current.x - mouse.current.x) * 0.08;
        mouse.current.y += (target.current.y - mouse.current.y) * 0.08;
        radius.current  += (targetR.current  - radius.current)  * 0.06;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uMouse,  mouse.current.x, mouse.current.y);
        gl.uniform1f(uRadius, radius.current);
        gl.uniform1f(uTime,   timeRef.current);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        rafRef.current = requestAnimationFrame(render);
      };
      render();
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      target.current.x = (e.clientX - r.left) / r.width;
      target.current.y = 1.0 - (e.clientY - r.top) / r.height;
      targetR.current  = 0.22;
    };
    const onLeave = () => { targetR.current = 0.0; target.current = { x: -1, y: -1 }; };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.heroBottom} />;
}
