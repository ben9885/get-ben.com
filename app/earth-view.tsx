"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { City } from "./atmosphere";

const CITY = {
  SF: { lat: 37.7749, lng: -122.4194, accent: new THREE.Color("#b8e7ff") },
  NY: { lat: 40.7128, lng: -74.006, accent: new THREE.Color("#d9d4ff") },
};

function surfacePoint(lat: number, lng: number, radius = 1.012) {
  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(phi), -Math.cos(phi) * Math.sin(theta)).multiplyScalar(radius);
}

function cityRotation(city: City) {
  const c = CITY[city];
  return { x: THREE.MathUtils.degToRad(c.lat - 12), y: -Math.PI / 2 - THREE.MathUtils.degToRad(c.lng) };
}

function sunDirection(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - start) / 86400000;
  const declination = THREE.MathUtils.degToRad(-23.44 * Math.cos((2 * Math.PI / 365) * (day + 10)));
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const longitude = THREE.MathUtils.degToRad(180 - utcHours * 15);
  return new THREE.Vector3(Math.cos(declination) * Math.cos(longitude), Math.sin(declination), -Math.cos(declination) * Math.sin(longitude)).normalize();
}

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(.12, "rgba(210,235,255,.95)");
  gradient.addColorStop(.42, "rgba(130,190,255,.28)");
  gradient.addColorStop(1, "rgba(100,170,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export default function EarthView({ city, active }: { city: City; active: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const cityRef = useRef(city);

  useEffect(() => { cityRef.current = city; }, [city]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    document.documentElement.classList.add("earth-view-active");
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
      host.classList.add("earth-static");
      return () => document.documentElement.classList.remove("earth-view-active");
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = innerWidth < 700;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000207");
    const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 100);
    camera.position.set(0, 0, mobile ? 4.4 : 4.15);
    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const world = new THREE.Group();
    world.position.set(mobile ? 0 : -.18, mobile ? -.08 : -.12, 0);
    scene.add(world);
    const initial = cityRotation(cityRef.current);
    world.rotation.set(initial.x, initial.y, 0);
    let targetX = initial.x, targetY = initial.y;

    const loader = new THREE.TextureLoader();
    const day = loader.load("/earth/day.jpg");
    const night = loader.load("/earth/night.png");
    const normal = loader.load("/earth/normal.jpg");
    const clouds = loader.load("/earth/clouds.png");
    day.colorSpace = night.colorSpace = THREE.SRGBColorSpace;
    [day, night, normal, clouds].forEach(texture => { texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); });

    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: { dayMap: { value: day }, nightMap: { value: night }, normalMap: { value: normal }, sunDirection: { value: sunDirection() } },
      vertexShader: `varying vec2 vUv; varying vec3 vNormalW; varying vec3 vPositionW; void main(){vUv=uv; vNormalW=normalize(mat3(modelMatrix)*normal); vec4 wp=modelMatrix*vec4(position,1.); vPositionW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp;}`,
      fragmentShader: `uniform sampler2D dayMap; uniform sampler2D nightMap; uniform vec3 sunDirection; varying vec2 vUv; varying vec3 vNormalW; void main(){float light=dot(normalize(vNormalW),normalize(sunDirection)); float twilight=smoothstep(-.14,.2,light); vec3 day=texture2D(dayMap,vUv).rgb; vec3 night=texture2D(nightMap,vUv).rgb*1.35; vec3 dusk=vec3(.28,.11,.08)*smoothstep(-.18,.04,light)*(1.-smoothstep(.02,.22,light)); vec3 color=mix(night,day,twilight)+dusk; float limb=.78+.22*max(dot(normalize(vNormalW),vec3(0.,0.,1.)),0.); gl_FragColor=vec4(color*limb,1.);}`
    });
    const geometry = new THREE.SphereGeometry(1, mobile ? 64 : 96, mobile ? 40 : 64);
    const earth = new THREE.Mesh(geometry, earthMaterial);
    world.add(earth);
    const cloudMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ map: clouds, transparent: true, opacity: .19, depthWrite: false, blending: THREE.AdditiveBlending }));
    cloudMesh.scale.setScalar(1.004);
    world.add(cloudMesh);

    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.035, 64, 40), new THREE.ShaderMaterial({
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){vNormal=normalize(normalMatrix*normal); vec4 w=modelMatrix*vec4(position,1.); vWorldPosition=w.xyz; gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader: `varying vec3 vNormal; void main(){float rim=pow(1.-abs(dot(normalize(vNormal),vec3(0.,0.,1.))),5.); gl_FragColor=vec4(.25,.58,1.,rim*.34);}`
    }));
    world.add(atmosphere);

    const markerMap = glowTexture();
    const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: markerMap, color: CITY[cityRef.current].accent, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    marker.position.copy(surfacePoint(CITY[cityRef.current].lat, CITY[cityRef.current].lng));
    marker.scale.setScalar(.072);
    world.add(marker);

    const starCount = mobile ? 1050 : 1750;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 12 + Math.random() * 38, theta = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, s = Math.sqrt(1 - u * u);
      starPositions.set([radius * s * Math.cos(theta), radius * u, radius * s * Math.sin(theta)], i * 3);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: "#dce8ff", size: mobile ? .018 : .014, transparent: true, opacity: .52, sizeAttenuation: true, depthWrite: false }));
    scene.add(stars);

    const maxParticles = mobile ? 1400 : 3600;
    const positions = new Float32Array(maxParticles * 3), colors = new Float32Array(maxParticles * 3), sizes = new Float32Array(maxParticles);
    const velocity = Array.from({ length: maxParticles }, () => new THREE.Vector3());
    const age = new Float32Array(maxParticles), lifetime = new Float32Array(maxParticles);
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particlesGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    const particles = new THREE.Points(particlesGeo, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float size; varying vec3 vColor; void main(){vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=size*(220./-mv.z); gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying vec3 vColor; void main(){float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d); gl_FragColor=vec4(vColor,a*a);}`
    }));
    scene.add(particles);
    let cursor = 0;
    const emit = (origin: THREE.Vector3, count: number, trail = false, pointerVelocity = new THREE.Vector3()) => {
      const accent = CITY[cityRef.current].accent;
      for (let n = 0; n < count; n++) {
        const i = cursor++ % maxParticles, z = Math.random() * 2 - 1, theta = Math.random() * Math.PI * 2, radial = Math.sqrt(1 - z * z);
        positions.set([origin.x, origin.y, origin.z], i * 3);
        const speed = trail ? .06 + Math.random() * .12 : .18 + Math.random() * .55;
        velocity[i].set(radial * Math.cos(theta), radial * Math.sin(theta), z).multiplyScalar(speed).addScaledVector(pointerVelocity, trail ? .26 : 0);
        age[i] = 0; lifetime[i] = trail ? .4 + Math.random() * .75 : .85 + Math.random() * 1.6; sizes[i] = trail ? 1.3 + Math.random() * 2 : 1.8 + Math.random() * 3.4;
        const base = Math.random() < .25 ? accent : new THREE.Color().setHSL(.55 + Math.random() * .14, .35 + Math.random() * .28, .76 + Math.random() * .2);
        colors.set([base.r, base.g, base.b], i * 3);
      }
    };

    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    let down = false, dragging = false, downX = 0, downY = 0, lastX = 0, lastY = 0, lastTrail = 0, velocityX = 0, velocityY = 0, lastInteraction = performance.now();
    const pointerWorld = (event: PointerEvent) => {
      pointer.set(event.clientX / innerWidth * 2 - 1, -(event.clientY / innerHeight) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(earth)[0];
      if (hit) return hit.point.clone();
      const point = new THREE.Vector3(); raycaster.ray.intersectPlane(plane, point); return point;
    };
    const onDown = (event: PointerEvent) => { down = true; dragging = false; downX = lastX = event.clientX; downY = lastY = event.clientY; velocityX = velocityY = 0; lastInteraction = performance.now(); renderer.domElement.setPointerCapture(event.pointerId); };
    const onMove = (event: PointerEvent) => {
      if (!down) return;
      const dx = event.clientX - lastX, dy = event.clientY - lastY;
      if (Math.hypot(event.clientX - downX, event.clientY - downY) >= 6) dragging = true;
      if (dragging) {
        targetY += dx * .006; targetX = THREE.MathUtils.clamp(targetX + dy * .0045, -1.15, 1.15); velocityY = dx * .00065; velocityX = dy * .0005;
        const now = performance.now(); if (now - lastTrail > 40) { emit(pointerWorld(event), 7, true, new THREE.Vector3(dx, -dy, 0).multiplyScalar(.002)); lastTrail = now; }
      }
      lastX = event.clientX; lastY = event.clientY; lastInteraction = performance.now();
    };
    const onUp = (event: PointerEvent) => { if (down && !dragging) emit(pointerWorld(event), mobile ? 150 : 230); down = false; dragging = false; renderer.domElement.releasePointerCapture(event.pointerId); };
    renderer.domElement.addEventListener("pointerdown", onDown); renderer.domElement.addEventListener("pointermove", onMove); renderer.domElement.addEventListener("pointerup", onUp); renderer.domElement.addEventListener("pointercancel", onUp);

    let previousCity = cityRef.current, frame = 0, last = performance.now();
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min(.04, (now - last) / 1000); last = now;
      if (cityRef.current !== previousCity) {
        previousCity = cityRef.current; const rotation = cityRotation(previousCity); targetX = rotation.x; targetY = rotation.y;
        marker.position.copy(surfacePoint(CITY[previousCity].lat, CITY[previousCity].lng)); (marker.material as THREE.SpriteMaterial).color.copy(CITY[previousCity].accent);
      }
      if (!down) { targetX += velocityX; targetY += velocityY; velocityX *= .94; velocityY *= .94; if (!reduced && now - lastInteraction > 6000) targetY += dt * Math.PI * 2 / 300; }
      world.rotation.x += (targetX - world.rotation.x) * (reduced ? .2 : .055); world.rotation.y += (targetY - world.rotation.y) * (reduced ? .2 : .055);
      cloudMesh.rotation.y += reduced ? 0 : dt * .006;
      earthMaterial.uniforms.sunDirection.value.copy(sunDirection());
      for (let i = 0; i < maxParticles; i++) if (lifetime[i] > 0) {
        age[i] += dt; if (age[i] >= lifetime[i]) { lifetime[i] = 0; sizes[i] = 0; continue; }
        const fade = 1 - age[i] / lifetime[i], o = i * 3; velocity[i].multiplyScalar(.985); positions[o] += velocity[i].x * dt; positions[o + 1] += velocity[i].y * dt; positions[o + 2] += velocity[i].z * dt; sizes[i] *= .986; colors[o] *= fade > .12 ? .995 : .93; colors[o + 1] *= fade > .12 ? .995 : .93; colors[o + 2] *= fade > .12 ? .995 : .93;
      }
      (particlesGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true; (particlesGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true; (particlesGeo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener("resize", resize);
    return () => {
      document.documentElement.classList.remove("earth-view-active"); cancelAnimationFrame(frame); removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", onDown); renderer.domElement.removeEventListener("pointermove", onMove); renderer.domElement.removeEventListener("pointerup", onUp); renderer.domElement.removeEventListener("pointercancel", onUp);
      geometry.dispose(); starsGeo.dispose(); particlesGeo.dispose(); earthMaterial.dispose(); (cloudMesh.material as THREE.Material).dispose(); (atmosphere.material as THREE.Material).dispose(); (stars.material as THREE.Material).dispose(); (particles.material as THREE.Material).dispose(); markerMap.dispose(); day.dispose(); night.dispose(); normal.dispose(); clouds.dispose(); renderer.dispose(); host.replaceChildren();
    };
  }, []);

  return <div ref={mount} className={`earth-view ${active ? "is-open" : "is-closing"}`} aria-label="Interactive Earth view" />;
}
