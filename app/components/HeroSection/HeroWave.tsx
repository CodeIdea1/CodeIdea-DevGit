"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 a_pos;varying vec2 vUv;void main(){vUv=vec2(a_pos.x*.5+.5,.5-a_pos.y*.5);gl_Position=vec4(a_pos,0,1);}`;

const FRAG = `precision mediump float;
uniform sampler2D uTex;uniform vec2 uMouse;uniform float uStr;uniform float uTime;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
void main(){
  vec2 uv=vUv;vec2 d=uv-uMouse;
  float fall=smoothstep(.45,.0,length(d));
  if(fall<=0.0){discard;}
  float n1=n(uv*5.+uTime*.4)*2.-1.;float n2=n(uv*7.-uTime*.3)*2.-1.;
  vec2 w=vec2(n1,n2)*fall*uStr*.03+normalize(d+.001)*fall*uStr*-.02;
  vec4 c=texture2D(uTex,uv+w);
  gl_FragColor=vec4(c.rgb,c.a*fall*uStr);
}`;

export default function HeroWave({ className }: { className?: string }) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const imgRef    = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap   = wrapRef.current!;
    const img    = imgRef.current!;
    const canvas = canvasRef.current!;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const mk = (t: number, src: string) => {
      const s = gl.createShader(t)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const uM = gl.getUniformLocation(prog, "uMouse");
    const uS = gl.getUniformLocation(prog, "uStr");
    const uT = gl.getUniformLocation(prog, "uTime");
    gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);

    let ready = false, raf = 0, time = 0;
    let hov = false, str = 0, tStr = 0;
    let mx = .5, my = .5, rx = .5, ry = .5;

    const sync = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width  = Math.round(r.width);
      canvas.height = Math.round(r.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const upload = () => {
      sync();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      ready = true;
    };

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const inside = e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom;
      if (inside) { rx=(e.clientX-r.left)/r.width; ry=(e.clientY-r.top)/r.height; if(!hov){hov=true;tStr=1;} }
      else if (hov) { hov=false; tStr=0; }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!ready) return;
      time += .016;
      mx += (rx-mx)*.08; my += (ry-my)*.08;
      str += (tStr-str)*(hov?.05:.03);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (str < 0.01) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform2f(uM, mx, my);
      gl.uniform1f(uS, str);
      gl.uniform1f(uT, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const ro = new ResizeObserver(sync);
    ro.observe(wrap);
    window.addEventListener("mousemove", onMove);
    loop();

    if (img.complete && img.naturalWidth > 0) upload();
    else img.addEventListener("load", upload, { once: true });

    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src="/back1.webp" alt="Hero" style={{ width:"100%", height:"auto", display:"block" }} />
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />
    </div>
  );
}
