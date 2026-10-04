"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroSection.module.css";

const VERT = `
attribute vec2 a_pos;
attribute vec2 a_uv;
varying vec2 v_uv;
void main(){
  v_uv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_mouse;
uniform float u_strength;
varying vec2 v_uv;
void main(){
  vec2 diff = v_uv - u_mouse;
  float dist = length(diff);
  float ripple = u_strength * exp(-dist * 6.0) / (dist + 0.3);
  vec2 uv = v_uv + normalize(diff) * ripple * 0.04;
  gl_FragColor = texture2D(u_tex, uv);
}`;

export default function HeroImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const target = useRef({ x: 0.5, y: 0.5 });
  const strength = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl")!;
    if (!gl) return;

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

    // full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1,0,1, 1,-1,1,1, -1,1,0,0, 1,1,1,0]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const aUv  = gl.getAttribLocation(prog, "a_uv");
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUv,  2, gl.FLOAT, false, 16, 8);

    const uMouse    = gl.getUniformLocation(prog, "u_mouse");
    const uStrength = gl.getUniformLocation(prog, "u_strength");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "/back1.webp";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      const resize = () => {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resize();
      window.addEventListener("resize", resize);

      const render = () => {
        mouse.current.x += (target.current.x - mouse.current.x) * 0.07;
        mouse.current.y += (target.current.y - mouse.current.y) * 0.07;
        strength.current *= 0.92;

        gl.uniform2f(uMouse, mouse.current.x, mouse.current.y);
        gl.uniform1f(uStrength, strength.current);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        rafRef.current = requestAnimationFrame(render);
      };
      render();

      return () => window.removeEventListener("resize", resize);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      target.current.x = (e.clientX - r.left) / r.width;
      target.current.y = 1 - (e.clientY - r.top) / r.height;
      strength.current = Math.min(strength.current + 0.4, 1.2);
    };

    canvas.addEventListener("mousemove", onMove);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.heroBottom} />;
}
