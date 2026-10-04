"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
varying vec2 vUv;
void main() {
  vUv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform float uStr;
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p); vec2 f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}

void main(){
  vec2 uv = vUv;
  vec2 d = uv - uMouse;
  float fall = smoothstep(0.4, 0.0, length(d));
  float n1 = noise(uv * 4.0 + uTime * 0.3) * 2.0 - 1.0;
  float n2 = noise(uv * 6.0 - uTime * 0.2) * 2.0 - 1.0;
  vec2 warp = vec2(n1, n2) * fall * uStr * 0.025
            + normalize(d + 0.001) * fall * uStr * -0.015;
  gl_FragColor = texture2D(uTex, uv + warp);
}
`;

export default function CloudDistortion({ className, src = "/rock.webp" }: { className?: string; src?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const domImg = el.querySelector("img") as HTMLImageElement;

    const init = () => {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
      el.style.position = "relative";
      el.appendChild(canvas);

      const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
      if (!gl) return;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const mkShader = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };

      const prog = gl.createProgram()!;
      gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, domImg);

      const uMouse = gl.getUniformLocation(prog, "uMouse");
      const uStr   = gl.getUniformLocation(prog, "uStr");
      const uTime  = gl.getUniformLocation(prog, "uTime");
      gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);

      const resize = () => {
        const r = el.getBoundingClientRect();
        canvas.width  = Math.round(r.width);
        canvas.height = Math.round(r.height);
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      domImg.style.visibility = "hidden";

      let raf = 0, time = 0;
      let hovering = false, str = 0, tStr = 0;
      let mx = 0.5, my = 0.5, rx = 0.5, ry = 0.5;

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right &&
                       e.clientY >= r.top  && e.clientY <= r.bottom;
        if (inside) {
          rx = (e.clientX - r.left) / r.width;
          ry = (e.clientY - r.top) / r.height;
          if (!hovering) { hovering = true; tStr = 1; }
        } else if (hovering) {
          hovering = false; tStr = 0;
        }
      };
      window.addEventListener("mousemove", onMove);

      const loop = () => {
        raf = requestAnimationFrame(loop);
        time += 0.016;
        mx += (rx - mx) * 0.08;
        my += (ry - my) * 0.08;
        str += (tStr - str) * (hovering ? 0.05 : 0.03);

        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform2f(uMouse, mx, my);
        gl.uniform1f(uStr,   str);
        gl.uniform1f(uTime,  time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      loop();

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("mousemove", onMove);
        canvas.remove();
      };
    };

    // انتظر تحميل الصورة أولاً
    if (domImg.complete && domImg.naturalWidth > 0) {
      return init();
    } else {
      let cleanup: (() => void) | undefined;
      domImg.onload = () => { cleanup = init() ?? undefined; };
      return () => cleanup?.();
    }
  }, [src]);

  return (
    <div ref={ref} className={className} style={{ lineHeight: 0 }}>
      <img src={src} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
    </div>
  );
}
