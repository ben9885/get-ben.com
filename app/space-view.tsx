"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SAFE_SELECTOR = "a,button,input,textarea,select,iframe,video,audio,[data-interactive]";

export default function SpaceView({ active }: { active: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) { host.classList.add("space-static"); return; }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = innerWidth < 700;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1 : 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 1);
    host.appendChild(renderer.domElement);

    const noise = new THREE.TextureLoader().load("/clouds/noise.png");
    noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
    noise.minFilter = THREE.LinearMipmapLinearFilter;
    const drawingSize = new THREE.Vector2();
    renderer.getDrawingBufferSize(drawingSize);
    const iterations = mobile ? 52 : 96;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        iResolution: { value: drawingSize },
        iMouse: { value: new THREE.Vector2(.5, .5) },
        iTime: { value: 0 },
        iTex: { value: noise },
        speed: { value: 1.7 },
        skyColor: { value: new THREE.Color(0x5ca6ca) },
        cloudColor: { value: new THREE.Color(0x334d80) },
        lightColor: { value: new THREE.Color(0xffffff) },
        scrollOffset: { value: 0 },
        pulsePoint: { value: new THREE.Vector2(-2, -2) },
        pulse: { value: 0 },
      },
      vertexShader: `void main(){gl_Position=vec4(position,1.);}`,
      fragmentShader: `
        precision highp float;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        uniform float iTime;
        uniform sampler2D iTex;
        uniform float speed;
        uniform vec3 skyColor;
        uniform vec3 cloudColor;
        uniform vec3 lightColor;
        uniform float scrollOffset;
        uniform vec2 pulsePoint;
        uniform float pulse;
        #define T texture2D(iTex,fract((s*p.zw+ceil(s*p.x))/200.0)).y/(s+=s)*4.0
        void main(){
          vec2 coord=gl_FragCoord.xy;
          vec2 mouseShift=(iMouse-.5)*vec2(.11,.065);
          vec4 p,d=vec4(.8,0.,coord/iResolution.y-.65+mouseShift);
          vec3 color=skyColor-d.w;
          float s,f,t=200.0+sin(dot(coord,coord));
          for(float i=1.0;i<=${iterations}.0;i+=1.0){
            t-=2.0;
            if(t<0.0)break;
            p=.05*t*d;
            p.xz+=iTime*.5*speed+scrollOffset;
            p.x+=sin(iTime*.25*speed)*.25;
            s=2.0;
            f=p.w+1.0-T-T-T-T;
            if(f<0.0){
              vec3 shade=mix(lightColor,cloudColor,-f);
              color=mix(color,shade,-f*.4);
            }
          }
          vec2 uv=coord/iResolution;
          float ripple=exp(-distance(uv,pulsePoint)*18.0)*sin(pulse*3.1415926)*(1.0-pulse);
          color+=lightColor*ripple*.16;
          float vignette=1.0-smoothstep(.25,.78,length(uv-.5));
          color*=mix(.83,1.,vignette);
          gl_FragColor=vec4(color,1.);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    let targetMouseX = .5, targetMouseY = .5, mouseX = .5, mouseY = .5;
    let scrollVelocity = 0, lastScroll = scrollY;
    const safe = (event: PointerEvent) => (event.target as Element)?.closest?.(SAFE_SELECTOR);
    const onPointerMove = (event: PointerEvent) => {
      if (!activeRef.current || reduced) return;
      targetMouseX = event.clientX / innerWidth;
      targetMouseY = 1 - event.clientY / innerHeight;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!activeRef.current || safe(event)) return;
      material.uniforms.pulsePoint.value.set(event.clientX / innerWidth, 1 - event.clientY / innerHeight);
      material.uniforms.pulse.value = .001;
    };
    addEventListener("pointermove", onPointerMove, { passive: true });
    addEventListener("pointerdown", onPointerDown, { passive: true });

    let frame = 0, last = performance.now(), elapsed = 0;
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min(.04, (now - last) / 1000); last = now;
      if (!activeRef.current) return;
      if (!reduced) elapsed += dt;
      const deltaScroll = scrollY - lastScroll; lastScroll = scrollY;
      scrollVelocity += (THREE.MathUtils.clamp(deltaScroll * .0025, -.32, .32) - scrollVelocity) * .12;
      scrollVelocity *= .92;
      mouseX += (targetMouseX - mouseX) * .025;
      mouseY += (targetMouseY - mouseY) * .025;
      material.uniforms.iMouse.value.set(reduced ? .5 : mouseX, reduced ? .5 : mouseY);
      material.uniforms.iTime.value = elapsed;
      material.uniforms.scrollOffset.value = reduced ? 0 : scrollY * .00045 + scrollVelocity;
      if (material.uniforms.pulse.value > 0) {
        material.uniforms.pulse.value += dt * 1.45;
        if (material.uniforms.pulse.value >= 1) material.uniforms.pulse.value = 0;
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    const resize = () => {
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1 : 1.5));
      renderer.setSize(innerWidth, innerHeight);
      renderer.getDrawingBufferSize(material.uniforms.iResolution.value);
    };
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("pointerdown", onPointerDown);
      geometry.dispose(); material.dispose(); noise.dispose(); renderer.dispose(); host.replaceChildren();
    };
  }, []);

  return <div ref={mount} className={`space-view cloud-view ${active ? "is-active" : ""}`} aria-hidden />;
}
