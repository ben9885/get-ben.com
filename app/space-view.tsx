"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SAFE_SELECTOR = "a,button,input,textarea,select,iframe,video,audio,[data-interactive]";
const SECTION_IDS = ["about", "contra", "research", "investments", "projects", "contact"];
const SIGNATURE_STARS = 28;
const LINE_COUNT = 12;

type Burst = { at: number; point: THREE.Vector3 };
type SpaceInteraction = { type: "project"; x: number; y: number; open: boolean };

function random(seed: number) {
  let value = seed >>> 0;
  return () => ((value = Math.imul(value ^ value >>> 15, 1 | value), value ^= value + Math.imul(value ^ value >>> 7, 61 | value), ((value ^ value >>> 14) >>> 0) / 4294967296));
}

function signaturePoint(section: number, index: number, rnd: () => number) {
  const t = index / SIGNATURE_STARS;
  if (section === 0) {
    return [2.25 + t * 4.5, -2.5 + t * 5.2 + Math.sin(t * Math.PI * 3) * .42, -2.8 - rnd() * 1.5];
  }
  if (section === 1) {
    const arm = index % 4, step = Math.floor(index / 4) / 6, angle = Math.PI * .25 + arm * Math.PI * .5;
    const radius = .08 + Math.pow(step, .72) * 1.72;
    return [3.15 + Math.cos(angle) * radius, .55 + Math.sin(angle) * radius, -2.55 - rnd() * 1.1];
  }
  if (section === 2) {
    const column = index % 7, row = Math.floor(index / 7);
    return [1.85 + column * .68, -1.18 + row * .7 + (column % 2) * .06, -2.7 - rnd() * .8];
  }
  if (section === 3) {
    const cluster = index % 3, step = Math.floor(index / 3), centers = [[2.35, 1.35], [4.45, .1], [2.55, -1.45]];
    const angle = step / 10 * Math.PI * 2 + cluster * .55, radius = .38 + (step % 3) * .18;
    return [centers[cluster][0] + Math.cos(angle) * radius, centers[cluster][1] + Math.sin(angle) * radius * .68, -2.7 - cluster * .48 - rnd() * .5];
  }
  if (section === 4) {
    const loop = t * 4, side = Math.floor(loop), u = loop - side;
    const x = side === 0 ? 1.35 + u * 4.9 : side === 1 ? 6.25 : side === 2 ? 6.25 - u * 4.9 : 1.35;
    const y = side === 0 ? 2.15 : side === 1 ? 2.15 - u * 3.9 : side === 2 ? -1.75 : -1.75 + u * 3.9;
    return [x, y, -2.9 - rnd() * .9];
  }
  const angle = t * Math.PI * 2 - Math.PI * .5, radius = 1.75 + Math.sin(index * 2.37) * .12;
  return [3.25 + Math.cos(angle) * radius, .15 + Math.sin(angle) * radius, -2.8 - rnd() * .8];
}

function makeComposition(count: number, section: number) {
  const rnd = random(4109 + section * 997), ambient = random(9127), result = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (i < SIGNATURE_STARS) {
      result.set(signaturePoint(section, i, rnd), i * 3);
      continue;
    }
    const layer = i / count < .06 ? 0 : i / count < .3 ? 1 : 2;
    let x = (ambient() * 2 - 1) * (6.8 + layer * 1.9), y = (ambient() * 2 - 1) * (4.2 + layer * 1.15);
    const cluster = ambient() < .12;
    if (cluster) {
      const angle = ambient() * Math.PI * 2, radius = Math.pow(ambient(), 1.8) * 1.3;
      const centerX = ambient() < .5 ? 3.2 : -3.5, centerY = ambient() < .5 ? 1.7 : -1.8;
      x = centerX + Math.cos(angle) * radius; y = centerY + Math.sin(angle) * radius;
    }
    if (x < 1.8 && x > -5.8 && y > -.95 && y < 3.3 && ambient() < .78) x += x > -1.7 ? 3.2 : -2.3;
    result.set([x, y, -1.8 - layer * 3.3 - ambient() * 3.1], i * 3);
  }
  return result;
}

function makeEdges(section: number) {
  const edges: [number, number][] = [];
  if (section === 2) {
    for (let col = 0; col < 6; col++) edges.push([col, col + 1]);
    for (let col = 0; col < 6; col++) edges.push([col, col + 7]);
  } else if (section === 1) {
    for (let i = 0; i < LINE_COUNT; i++) edges.push([i, (i + 4) % SIGNATURE_STARS]);
  } else {
    for (let i = 0; i < LINE_COUNT; i++) { const start = Math.floor(i * SIGNATURE_STARS / LINE_COUNT); edges.push([start, (start + 1) % SIGNATURE_STARS]); }
  }
  while (edges.length < LINE_COUNT) edges.push([edges.length % SIGNATURE_STARS, (edges.length + 1) % SIGNATURE_STARS]);
  return edges.slice(0, LINE_COUNT);
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
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.2 : 1.5)); renderer.setSize(innerWidth, innerHeight); renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const count = mobile ? 650 : 1400, compositions = SECTION_IDS.map((_, i) => makeComposition(count, i)), edges = SECTION_IDS.map((_, i) => makeEdges(i));
    const sizes = new Float32Array(count), colors = new Float32Array(count * 3), depths = new Float32Array(count), seeds = new Float32Array(count);
    const rnd = random(7181);
    for (let i = 0; i < count; i++) {
      const layer = i / count < .06 ? 0 : i / count < .3 ? 1 : 2;
      sizes[i] = layer === 0 ? 2.05 + rnd() * 1.75 : layer === 1 ? 1.18 + rnd() * 1.05 : .58 + rnd() * .7;
      if (i < SIGNATURE_STARS) sizes[i] *= 1.08;
      if (rnd() < .008) sizes[i] *= 1.45;
      depths[i] = layer; seeds[i] = rnd();
      const color = new THREE.Color().setHSL(.59 + rnd() * .045, .025 + rnd() * .08, .8 + rnd() * .14);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(compositions[0], 3));
    starsGeo.setAttribute("targetPosition", new THREE.BufferAttribute(compositions[1], 3));
    starsGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    starsGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starsGeo.setAttribute("depthLayer", new THREE.BufferAttribute(depths, 1));
    starsGeo.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        morph: { value: 0 }, time: { value: 0 }, pointer: { value: new THREE.Vector2() },
        pointerPoint: { value: new THREE.Vector2(99, 99) }, hoverActive: { value: 0 }, scrollForce: { value: 0 },
        gravityPoint: { value: new THREE.Vector2(3, 0) }, gravityStrength: { value: 0 },
        elementPoint: { value: new THREE.Vector2(99, 99) }, elementHover: { value: 0 },
        clickPoint: { value: new THREE.Vector2(99, 99) }, pulse: { value: 0 }, opacity: { value: 0 }
      },
      transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 targetPosition;attribute float size;attribute float depthLayer;attribute float seed;varying vec3 vColor;varying float vSparkle;uniform float morph;uniform float time;uniform vec2 pointer;uniform vec2 pointerPoint;uniform float hoverActive;uniform float scrollForce;uniform vec2 gravityPoint;uniform float gravityStrength;uniform vec2 elementPoint;uniform float elementHover;uniform vec2 clickPoint;uniform float pulse;void main(){vColor=color;vSparkle=clamp((size-2.65)*.45,0.,1.);float eased=morph*morph*(3.-2.*morph);vec3 p=mix(position,targetPosition,eased);float factor=depthLayer<.5?.46:depthLayer<1.5?.24:.1;p.xy+=pointer*factor;p.z+=scrollForce*factor*.45;vec2 gravity=gravityPoint-p.xy;float gravityInfluence=smoothstep(4.2,.4,length(gravity))*gravityStrength;p.xy+=gravity*gravityInfluence*.008*factor;vec2 hoverDelta=p.xy-pointerPoint;float hoverInfluence=smoothstep(.78,0.,length(hoverDelta))*hoverActive;p.xy+=normalize(hoverDelta+.0001)*hoverInfluence*.034*factor;vec2 elementDelta=p.xy-elementPoint;float elementInfluence=smoothstep(1.35,.18,length(elementDelta))*elementHover;p.xy+=vec2(-elementDelta.y,elementDelta.x)*elementInfluence*.011*factor;float dist=distance(p.xy,clickPoint);float influence=smoothstep(1.45,0.,dist);float compression=pulse<.18?-(pulse/.18):sin((pulse-.18)/.82*3.14159);float wave=exp(-pow((dist-pulse*2.15)*6.,2.))*sin(pulse*12.5664);p.xy+=normalize(p.xy-clickPoint+.0001)*influence*compression*.115;p.z+=wave*.22*(1.-pulse);p.z+=sin(time*.42+seed*18.)*.004*factor;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=size*(198./-mv.z)*(1.+wave*.08);gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying vec3 vColor;varying float vSparkle;uniform float opacity;void main(){vec2 q=gl_PointCoord-.5;float d=length(q);float core=smoothstep(.135,.018,d);float halo=smoothstep(.5,.09,d)*.12;float cross=(smoothstep(.028,0.,abs(q.x))*smoothstep(.34,.08,abs(q.y))+smoothstep(.028,0.,abs(q.y))*smoothstep(.34,.08,abs(q.x)))*vSparkle*.12;float a=(core+halo+cross)*opacity;vec3 sharp=mix(vColor,vec3(1.),core*.58);gl_FragColor=vec4(sharp,a);}`
    });
    scene.add(new THREE.Points(starsGeo, starMaterial));

    const linePositions = new Float32Array(LINE_COUNT * 6), lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xc9dcf3, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const constellationLines = new THREE.LineSegments(lineGeo, lineMaterial); constellationLines.renderOrder = -1; scene.add(constellationLines);

    const maxTemp = mobile ? 120 : 240, tempPositions = new Float32Array(maxTemp * 3), tempTargets = new Float32Array(maxTemp * 3), tempColors = new Float32Array(maxTemp * 3), tempSizes = new Float32Array(maxTemp), tempKind = new Uint8Array(maxTemp);
    const velocity = Array.from({ length: maxTemp }, () => new THREE.Vector3()), age = new Float32Array(maxTemp), life = new Float32Array(maxTemp);
    const tempGeo = new THREE.BufferGeometry(); tempGeo.setAttribute("position", new THREE.BufferAttribute(tempPositions, 3)); tempGeo.setAttribute("color", new THREE.BufferAttribute(tempColors, 3)); tempGeo.setAttribute("size", new THREE.BufferAttribute(tempSizes, 1));
    const tempMaterial = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending, vertexShader: `attribute float size;varying vec3 vColor;varying float vSharp;void main(){vColor=color;vSharp=clamp(size*.18,0.,1.);vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*(190./-mv.z);gl_Position=projectionMatrix*mv;}`, fragmentShader: `varying vec3 vColor;varying float vSharp;void main(){vec2 q=gl_PointCoord-.5;float d=length(q);float core=smoothstep(.13,.015,d);float halo=smoothstep(.5,.09,d)*.15;float cross=(smoothstep(.026,0.,abs(q.x))*smoothstep(.32,.08,abs(q.y))+smoothstep(.026,0.,abs(q.y))*smoothstep(.32,.08,abs(q.x)))*vSharp*.1;gl_FragColor=vec4(mix(vColor,vec3(1.),core*.58),core+halo+cross);}` });
    scene.add(new THREE.Points(tempGeo, tempMaterial));
    let cursor = 0;
    const paintTemp = (i: number, size: number, duration: number) => {
      age[i] = 0; life[i] = duration; tempSizes[i] = size;
      const color = new THREE.Color().setHSL(.6 + Math.random() * .035, .03 + Math.random() * .08, .82 + Math.random() * .12);
      tempColors.set([color.r, color.g, color.b], i * 3);
    };
    const emit = (origin: THREE.Vector3, amount: number) => {
      for (let n = 0; n < amount; n++) {
        const i = cursor++ % maxTemp, angle = Math.random() * Math.PI * 2, z = (Math.random() * 2 - 1) * .4, radial = Math.sqrt(1 - z * z), speed = .12 + Math.random() * .24;
        tempPositions.set([origin.x, origin.y, origin.z], i * 3); tempKind[i] = 0;
        velocity[i].set(Math.cos(angle) * radial, Math.sin(angle) * radial, z).multiplyScalar(speed);
        paintTemp(i, 1 + Math.random() * 1.8, .55 + Math.random() * .3);
      }
    };
    const emitCore = (origin: THREE.Vector3) => {
      const i = cursor++ % maxTemp; tempPositions.set([origin.x, origin.y, origin.z], i * 3); tempKind[i] = 0;
      velocity[i].set(0, 0, .018); paintTemp(i, mobile ? 6.5 : 9, reduced ? .24 : .34); tempColors.set([1, .99, .96], i * 3);
    };
    const emitTargetShape = (origin: THREE.Vector3, amount: number, pointAt: (n: number, amount: number) => [number, number], duration: number) => {
      for (let n = 0; n < amount; n++) {
        const i = cursor++ % maxTemp, target = pointAt(n, amount);
        tempPositions.set([origin.x + (Math.random() - .5) * .08, origin.y + (Math.random() - .5) * .08, origin.z + (Math.random() - .5) * .08], i * 3);
        tempTargets.set([origin.x + target[0], origin.y + target[1], origin.z - .15 + Math.sin(n * 1.7) * .08], i * 3);
        tempKind[i] = 1; velocity[i].set(0, 0, 0); paintTemp(i, 1 + Math.random() * 1.5, duration + Math.random() * .18);
      }
    };
    const emitProjectFrame = (origin: THREE.Vector3, open: boolean) => emitTargetShape(origin, mobile ? 18 : 24, (n, total) => {
      const loop = n / total * 4, side = Math.floor(loop), u = loop - side, width = open ? 1.05 : .78, height = width * .5625;
      return [side === 0 ? -width + u * width * 2 : side === 1 ? width : side === 2 ? width - u * width * 2 : -width, side === 0 ? height : side === 1 ? height - u * height * 2 : side === 2 ? -height : -height + u * height * 2];
    }, open ? .95 : .7);
    const pendingBursts: Burst[] = [];

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), ray = new THREE.Raycaster(), pointerNdc = new THREE.Vector2();
    const worldPoint = (x: number, y: number) => { pointerNdc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(pointerNdc, camera); const point = new THREE.Vector3(); ray.ray.intersectPlane(plane, point); return point; };
    let pair = 0, pointerTargetX = 0, pointerTargetY = 0, down = false, dragged = false, downX = 0, downY = 0, lastClick = 0, hoveredElement: Element | null = null;
    const safe = (event: PointerEvent) => (event.target as Element)?.closest?.(SAFE_SELECTOR);
    const onPointerMove = (event: PointerEvent) => {
      pointerTargetX = (event.clientX / innerWidth - .5) * .04; pointerTargetY = -(event.clientY / innerHeight - .5) * .025;
      if (!activeRef.current) return;
      const interactive = (event.target as Element)?.closest?.("[data-space-effect]");
      if (safe(event)) {
        starMaterial.uniforms.hoverActive.value = 0;
        if (interactive) {
          const rect = interactive.getBoundingClientRect(), point = worldPoint(rect.left + rect.width * .5, rect.top + rect.height * .5);
          starMaterial.uniforms.elementPoint.value.set(point.x, point.y); starMaterial.uniforms.elementHover.value = reduced ? 0 : 1; hoveredElement = interactive;
        } else { starMaterial.uniforms.elementHover.value = 0; hoveredElement = null; }
        return;
      }
      if (hoveredElement) { starMaterial.uniforms.elementHover.value = 0; hoveredElement = null; }
      const point = worldPoint(event.clientX, event.clientY);
      starMaterial.uniforms.pointerPoint.value.set(point.x, point.y); starMaterial.uniforms.hoverActive.value = reduced ? 0 : 1;
      if (down && Math.hypot(event.clientX - downX, event.clientY - downY) > 6) dragged = true;
    };
    const onPointerDown = (event: PointerEvent) => { if (!activeRef.current || safe(event)) return; down = true; dragged = false; downX = event.clientX; downY = event.clientY; };
    const onPointerUp = (event: PointerEvent) => {
      if (!activeRef.current || !down || safe(event)) { down = false; return; }
      const now = performance.now();
      if (!dragged && now - lastClick > 600) {
        lastClick = now;
        const point = worldPoint(event.clientX, event.clientY); starMaterial.uniforms.clickPoint.value.set(point.x, point.y); starMaterial.uniforms.pulse.value = .001; emitCore(point);
        if (!reduced) pendingBursts.push({ at: now + 85, point });
      }
      down = false;
    };
    const onPointerLeave = () => { starMaterial.uniforms.hoverActive.value = 0; starMaterial.uniforms.elementHover.value = 0; down = false; };
    const onSpaceInteraction = (event: Event) => {
      if (!activeRef.current) return;
      const detail = (event as CustomEvent<SpaceInteraction>).detail; if (!detail || detail.type !== "project") return;
      const point = worldPoint(detail.x, detail.y); starMaterial.uniforms.clickPoint.value.set(point.x, point.y); starMaterial.uniforms.pulse.value = .001; emitCore(point); emitProjectFrame(point, detail.open);
    };
    addEventListener("pointermove", onPointerMove, { passive: true }); addEventListener("pointerdown", onPointerDown, { passive: true }); addEventListener("pointerup", onPointerUp, { passive: true }); addEventListener("pointerleave", onPointerLeave); addEventListener("space-interaction", onSpaceInteraction);

    let sectionCenters: number[] = [], scrollVelocity = 0, lastScroll = scrollY, lastTime = performance.now(), frame = 0, currentPointerX = 0, currentPointerY = 0, smoothMorph = 0;
    const measure = () => { sectionCenters = SECTION_IDS.map(id => { const element = document.getElementById(id); return element ? element.offsetTop + element.offsetHeight * .5 : 0; }); };
    const resizeObserver = new ResizeObserver(measure); SECTION_IDS.forEach(id => { const el = document.getElementById(id); if (el) resizeObserver.observe(el); }); measure();
    const scrollState = () => {
      const point = scrollY + innerHeight * .5; let index = 0; while (index < sectionCenters.length - 2 && point > sectionCenters[index + 1]) index++;
      const span = Math.max(1, sectionCenters[index + 1] - sectionCenters[index]); return { index, t: THREE.MathUtils.clamp((point - sectionCenters[index]) / span, 0, 1) };
    };
    const updateLines = (index: number, morph: number) => {
      const next = Math.min(index + 1, compositions.length - 1), from = compositions[index], to = compositions[next], fromEdges = edges[index], toEdges = edges[next];
      for (let i = 0; i < LINE_COUNT; i++) for (let endpoint = 0; endpoint < 2; endpoint++) {
        const fromIndex = fromEdges[i][endpoint] * 3, toIndex = toEdges[i][endpoint] * 3, out = i * 6 + endpoint * 3;
        linePositions[out] = THREE.MathUtils.lerp(from[fromIndex], to[toIndex], morph); linePositions[out + 1] = THREE.MathUtils.lerp(from[fromIndex + 1], to[toIndex + 1], morph); linePositions[out + 2] = THREE.MathUtils.lerp(from[fromIndex + 2], to[toIndex + 2], morph);
      }
      (lineGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    };
    const gravityPoints = [[3.6, 1.25], [3.15, .55], [3.85, .1], [3.15, .15], [3.7, .15], [3.25, .15]];
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate); if (!activeRef.current && starMaterial.uniforms.opacity.value < .002) return;
      const dt = Math.min(.04, (now - lastTime) / 1000); lastTime = now; const state = scrollState();
      if (state.index !== pair) {
        pair = state.index; smoothMorph = state.t;
        (starsGeo.attributes.position as THREE.BufferAttribute).array = compositions[pair]; (starsGeo.attributes.targetPosition as THREE.BufferAttribute).array = compositions[Math.min(pair + 1, compositions.length - 1)]; starsGeo.attributes.position.needsUpdate = starsGeo.attributes.targetPosition.needsUpdate = true;
      }
      smoothMorph += (state.t - smoothMorph) * (reduced ? 1 : .035); const easedMorph = smoothMorph * smoothMorph * (3 - 2 * smoothMorph); starMaterial.uniforms.morph.value = smoothMorph; starMaterial.uniforms.time.value = now * .001;
      const deltaScroll = scrollY - lastScroll; lastScroll = scrollY; scrollVelocity += (THREE.MathUtils.clamp(deltaScroll * .0025, -.38, .38) - scrollVelocity) * .1; scrollVelocity *= .88;
      currentPointerX += (pointerTargetX - currentPointerX) * (reduced ? .2 : .025); currentPointerY += (pointerTargetY - currentPointerY) * (reduced ? .2 : .025); starMaterial.uniforms.pointer.value.set(reduced ? 0 : currentPointerX, reduced ? 0 : currentPointerY); starMaterial.uniforms.scrollForce.value = reduced ? 0 : scrollVelocity;
      const gravityA = gravityPoints[pair], gravityB = gravityPoints[Math.min(pair + 1, gravityPoints.length - 1)]; starMaterial.uniforms.gravityPoint.value.set(THREE.MathUtils.lerp(gravityA[0], gravityB[0], easedMorph), THREE.MathUtils.lerp(gravityA[1], gravityB[1], easedMorph)); starMaterial.uniforms.gravityStrength.value = reduced ? 0 : .2 + Math.sin(easedMorph * Math.PI) * .08;
      const linePhase = mobile ? 0 : pair === 1 ? THREE.MathUtils.smoothstep(easedMorph, .25, .92) : pair === 2 ? 1 - THREE.MathUtils.smoothstep(easedMorph, 0, .22) : 0;
      starMaterial.uniforms.opacity.value += ((activeRef.current ? .82 : 0) - starMaterial.uniforms.opacity.value) * (reduced ? .2 : .04); lineMaterial.opacity += ((activeRef.current ? .035 * linePhase : 0) - lineMaterial.opacity) * .055;
      if (starMaterial.uniforms.pulse.value > 0) { starMaterial.uniforms.pulse.value += dt * 1.45; if (starMaterial.uniforms.pulse.value >= 1) starMaterial.uniforms.pulse.value = 0; }
      while (pendingBursts.length && pendingBursts[0].at <= now) { const burst = pendingBursts.shift()!; emit(burst.point, mobile ? 14 : 22); }
      for (let i = 0; i < maxTemp; i++) if (life[i] > 0) {
        age[i] += dt; if (age[i] >= life[i]) { life[i] = 0; tempSizes[i] = 0; continue; }
        const o = i * 3, fade = 1 - age[i] / life[i];
        if (tempKind[i] === 1) { const spring = 1 - Math.exp(-dt * 7.5); tempPositions[o] += (tempTargets[o] - tempPositions[o]) * spring; tempPositions[o + 1] += (tempTargets[o + 1] - tempPositions[o + 1]) * spring; tempPositions[o + 2] += (tempTargets[o + 2] - tempPositions[o + 2]) * spring; }
        else { velocity[i].multiplyScalar(.975); tempPositions[o] += velocity[i].x * dt; tempPositions[o + 1] += velocity[i].y * dt; tempPositions[o + 2] += velocity[i].z * dt; }
        if (fade < .32) { tempSizes[i] *= .9; tempColors[o] *= .94; tempColors[o + 1] *= .94; tempColors[o + 2] *= .94; } else if (tempKind[i] === 0) tempSizes[i] *= .988;
      }
      updateLines(pair, easedMorph); (tempGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true; (tempGeo.attributes.size as THREE.BufferAttribute).needsUpdate = true; (tempGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true; renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.2 : 1.5)); renderer.setSize(innerWidth, innerHeight); measure(); };
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame); resizeObserver.disconnect(); removeEventListener("resize", resize); removeEventListener("pointermove", onPointerMove); removeEventListener("pointerdown", onPointerDown); removeEventListener("pointerup", onPointerUp); removeEventListener("pointerleave", onPointerLeave); removeEventListener("space-interaction", onSpaceInteraction);
      starsGeo.dispose(); starMaterial.dispose(); lineGeo.dispose(); lineMaterial.dispose(); tempGeo.dispose(); tempMaterial.dispose(); renderer.dispose(); host.replaceChildren();
    };
  }, []);

  return <div ref={mount} className={`space-view ${active ? "is-active" : ""}`} aria-hidden />;
}
