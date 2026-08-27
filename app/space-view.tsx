"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SAFE_SELECTOR = "a,button,input,textarea,select,iframe,video,audio,[data-interactive]";
const SECTION_IDS = ["about", "contra", "research", "investments", "projects", "contact"];

function random(seed: number) {
  let value = seed >>> 0;
  return () => ((value = Math.imul(value ^ value >>> 15, 1 | value), value ^= value + Math.imul(value ^ value >>> 7, 61 | value), ((value ^ value >>> 14) >>> 0) / 4294967296));
}

function makeComposition(count: number, section: number) {
  const rnd = random(4109 + section * 997), result = new Float32Array(count * 3);
  const density = [0.72, 1.05, .9, .82, 1.12, .68][section] ?? 1;
  for (let i = 0; i < count; i++) {
    const layer = i / count < .08 ? 0 : i / count < .34 ? 1 : 2;
    let x = (rnd() * 2 - 1) * (6.7 + layer * 1.8), y = (rnd() * 2 - 1) * (4.1 + layer * 1.1);
    const cluster = rnd() < .34 * density;
    if (cluster) {
      const angle = rnd() * Math.PI * 2, radius = Math.pow(rnd(), 1.8) * (1.3 + section * .08);
      const centerX = section % 2 ? 2.8 : -3.1, centerY = section === 2 ? -1.7 : 1.7;
      x = centerX + Math.cos(angle) * radius; y = centerY + Math.sin(angle) * radius;
    }
    if (x < 1.8 && x > -5.6 && y > -.8 && y < 3.2 && rnd() < .68) x += x > -1.7 ? 3 : -2;
    result.set([x, y, -1.5 - layer * 3.2 - rnd() * 3.2], i * 3);
  }
  return result;
}

export default function SpaceView({ active }: { active: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) { host.classList.add("space-static"); return; }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, mobile = innerWidth < 700;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .1, 40);
    camera.position.z = 7;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight); renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const count = mobile ? 1350 : 3600, compositions = SECTION_IDS.map((_, i) => makeComposition(count, i));
    const sizes = new Float32Array(count), colors = new Float32Array(count * 3), depths = new Float32Array(count);
    const rnd = random(7181);
    for (let i = 0; i < count; i++) {
      const layer = i / count < .08 ? 0 : i / count < .34 ? 1 : 2;
      sizes[i] = layer === 0 ? 2.1 + rnd() * 2.1 : layer === 1 ? 1.25 + rnd() * 1.25 : .55 + rnd() * .85;
      depths[i] = layer;
      const color = new THREE.Color().setHSL(.56 + rnd() * .12, .16 + rnd() * .32, .68 + rnd() * .27);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(compositions[0], 3));
    starsGeo.setAttribute("targetPosition", new THREE.BufferAttribute(compositions[1], 3));
    starsGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    starsGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starsGeo.setAttribute("depthLayer", new THREE.BufferAttribute(depths, 1));
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: { morph: { value: 0 }, pointer: { value: new THREE.Vector2() }, scrollForce: { value: 0 }, clickPoint: { value: new THREE.Vector2(99, 99) }, pulse: { value: 0 }, opacity: { value: 0 } },
      transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 targetPosition; attribute float size; attribute float depthLayer; varying vec3 vColor; uniform float morph; uniform vec2 pointer; uniform float scrollForce; uniform vec2 clickPoint; uniform float pulse; void main(){vColor=color; vec3 p=mix(position,targetPosition,smoothstep(0.,1.,morph)); float factor=depthLayer<.5?1.:depthLayer<1.5?.42:.14; p.xy+=pointer*factor; p.z+=scrollForce*factor; float dist=distance(p.xy,clickPoint); float influence=smoothstep(2.1,0.,dist); p.xy+=normalize(p.xy-clickPoint+.0001)*influence*sin(pulse*3.14159)*.18; vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=size*(190./-mv.z); gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying vec3 vColor; uniform float opacity; void main(){float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d); gl_FragColor=vec4(vColor,a*a*opacity);}`
    });
    scene.add(new THREE.Points(starsGeo, starMaterial));

    const maxTemp = mobile ? 420 : 900, tempPositions = new Float32Array(maxTemp * 3), tempColors = new Float32Array(maxTemp * 3), tempSizes = new Float32Array(maxTemp);
    const velocity = Array.from({ length: maxTemp }, () => new THREE.Vector3()), age = new Float32Array(maxTemp), life = new Float32Array(maxTemp);
    const tempGeo = new THREE.BufferGeometry(); tempGeo.setAttribute("position", new THREE.BufferAttribute(tempPositions, 3)); tempGeo.setAttribute("color", new THREE.BufferAttribute(tempColors, 3)); tempGeo.setAttribute("size", new THREE.BufferAttribute(tempSizes, 1));
    const tempMaterial = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending, vertexShader: `attribute float size; varying vec3 vColor; void main(){vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=size*(180./-mv.z); gl_Position=projectionMatrix*mv;}`, fragmentShader: `varying vec3 vColor; void main(){float a=smoothstep(.5,0.,length(gl_PointCoord-.5)); gl_FragColor=vec4(vColor,a*a);}` });
    scene.add(new THREE.Points(tempGeo, tempMaterial));
    let cursor = 0;
    const emit = (origin: THREE.Vector3, amount: number, trail = false, inherited = new THREE.Vector3()) => {
      for (let n = 0; n < amount; n++) {
        const i = cursor++ % maxTemp, angle = Math.random() * Math.PI * 2, z = Math.random() * 2 - 1, radial = Math.sqrt(1 - z * z), speed = trail ? .07 + Math.random() * .16 : .22 + Math.random() * .55;
        tempPositions.set([origin.x, origin.y, origin.z], i * 3); velocity[i].set(Math.cos(angle) * radial, Math.sin(angle) * radial, z).multiplyScalar(speed).addScaledVector(inherited, .22);
        age[i] = 0; life[i] = trail ? .4 + Math.random() * .55 : .8 + Math.random(); tempSizes[i] = trail ? 1 + Math.random() * 1.5 : 1.4 + Math.random() * 2.8;
        const color = new THREE.Color().setHSL(.56 + Math.random() * .14, .28 + Math.random() * .32, .75 + Math.random() * .2); tempColors.set([color.r, color.g, color.b], i * 3);
      }
    };

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), ray = new THREE.Raycaster(), pointerNdc = new THREE.Vector2();
    const worldPoint = (x: number, y: number) => { pointerNdc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(pointerNdc, camera); const point = new THREE.Vector3(); ray.ray.intersectPlane(plane, point); return point; };
    let pointerTargetX = 0, pointerTargetY = 0, down = false, dragged = false, downX = 0, downY = 0, lastX = 0, lastY = 0, lastTrail = 0;
    const safe = (event: PointerEvent) => (event.target as Element)?.closest?.(SAFE_SELECTOR);
    const onPointerMove = (event: PointerEvent) => {
      pointerTargetX = (event.clientX / innerWidth - .5) * .12; pointerTargetY = -(event.clientY / innerHeight - .5) * .08;
      if (!activeRef.current || !down || safe(event)) return;
      const dx = event.clientX - lastX, dy = event.clientY - lastY; if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) dragged = true;
      if (dragged && performance.now() - lastTrail > 42 && (!mobile || event.pointerType === "mouse")) { emit(worldPoint(event.clientX, event.clientY), 6, true, new THREE.Vector3(dx, -dy, 0).multiplyScalar(.008)); lastTrail = performance.now(); }
      lastX = event.clientX; lastY = event.clientY;
    };
    const onPointerDown = (event: PointerEvent) => { if (!activeRef.current || safe(event)) return; down = true; dragged = false; downX = lastX = event.clientX; downY = lastY = event.clientY; };
    const onPointerUp = (event: PointerEvent) => { if (!activeRef.current || !down || safe(event)) { down = false; return; } if (!dragged) { const point = worldPoint(event.clientX, event.clientY); starMaterial.uniforms.clickPoint.value.set(point.x, point.y); starMaterial.uniforms.pulse.value = .001; emit(point, mobile ? 105 : 180); } down = false; };
    addEventListener("pointermove", onPointerMove, { passive: true }); addEventListener("pointerdown", onPointerDown, { passive: true }); addEventListener("pointerup", onPointerUp, { passive: true });

    let pair = -1, scrollVelocity = 0, lastScroll = scrollY, lastTime = performance.now(), frame = 0, currentPointerX = 0, currentPointerY = 0;
    const scrollState = () => {
      const centers = SECTION_IDS.map(id => { const element = document.getElementById(id); return element ? element.offsetTop + element.offsetHeight * .5 : 0; });
      const point = scrollY + innerHeight * .5; let index = 0; while (index < centers.length - 2 && point > centers[index + 1]) index++;
      const span = Math.max(1, centers[index + 1] - centers[index]); return { index, t: THREE.MathUtils.clamp((point - centers[index]) / span, 0, 1) };
    };
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate); if (!activeRef.current && starMaterial.uniforms.opacity.value < .002) return;
      const dt = Math.min(.04, (now - lastTime) / 1000); lastTime = now, state = scrollState();
      if (state.index !== pair) { pair = state.index; (starsGeo.attributes.position as THREE.BufferAttribute).array = compositions[pair]; (starsGeo.attributes.targetPosition as THREE.BufferAttribute).array = compositions[Math.min(pair + 1, compositions.length - 1)]; starsGeo.attributes.position.needsUpdate = starsGeo.attributes.targetPosition.needsUpdate = true; }
      starMaterial.uniforms.morph.value = state.t; const deltaScroll = scrollY - lastScroll; lastScroll = scrollY; scrollVelocity += (deltaScroll * .004 - scrollVelocity) * .08; scrollVelocity *= .9;
      currentPointerX += (pointerTargetX - currentPointerX) * (reduced ? .2 : .025); currentPointerY += (pointerTargetY - currentPointerY) * (reduced ? .2 : .025); starMaterial.uniforms.pointer.value.set(reduced ? 0 : currentPointerX, reduced ? 0 : currentPointerY); starMaterial.uniforms.scrollForce.value = reduced ? 0 : scrollVelocity;
      starMaterial.uniforms.opacity.value += ((activeRef.current ? 1 : 0) - starMaterial.uniforms.opacity.value) * (reduced ? .2 : .035); if (starMaterial.uniforms.pulse.value > 0) { starMaterial.uniforms.pulse.value += dt * 1.4; if (starMaterial.uniforms.pulse.value >= 1) starMaterial.uniforms.pulse.value = 0; }
      for (let i = 0; i < maxTemp; i++) if (life[i] > 0) { age[i] += dt; if (age[i] >= life[i]) { life[i] = 0; tempSizes[i] = 0; continue; } const o = i * 3, fade = 1 - age[i] / life[i]; velocity[i].multiplyScalar(.975); tempPositions[o] += velocity[i].x * dt; tempPositions[o + 1] += velocity[i].y * dt; tempPositions[o + 2] += velocity[i].z * dt; tempSizes[i] *= fade > .15 ? .988 : .88; }
      (tempGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true; (tempGeo.attributes.size as THREE.BufferAttribute).needsUpdate = true; renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); removeEventListener("resize", resize); removeEventListener("pointermove", onPointerMove); removeEventListener("pointerdown", onPointerDown); removeEventListener("pointerup", onPointerUp); starsGeo.dispose(); starMaterial.dispose(); tempGeo.dispose(); tempMaterial.dispose(); renderer.dispose(); host.replaceChildren(); };
  }, []);

  return <div ref={mount} className={`space-view ${active ? "is-active" : ""}`} aria-hidden />;
}
