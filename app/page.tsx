"use client";

import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AtmosphereBackground, CitySwitcher, useCityAtmosphere, type EnvironmentMode } from "./atmosphere";
import ExternalArrow from "./external-arrow";
import philosophicalQuotesData from "./data/philosophical-quotes.json";

const sections = ["about", "contra", "research", "investments", "projects", "contact"];
const SpaceView = lazy(() => import("./space-view"));
type PhilosophicalQuote = { quote: string; author: string; source: string; year: string };
const philosophicalQuotes = philosophicalQuotesData as PhilosophicalQuote[];
const getDailyQuoteIndex = (date = new Date()) => {
  const localDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(localDay / 86_400_000) % philosophicalQuotes.length;
};
const formatQuoteYear = (year: string) => year.replace(/^c\. (\d{1,3})$/, "c. $1 CE");

type Project = {
  n: string;
  title: string;
  date: string;
  id?: string;
  hash?: string;
  href?: string;
};

const projects: Project[] = [
  { n: "01", title: "The Human Creativity Benchmark", date: "Jun 2026", href: "https://x.com/contraben/status/2049884767630286859" },
  { n: "02", title: "Introducing Contra Labs", date: "Mar 2026", href: "https://x.com/contraben/status/2039021014244262000" },
  { n: "03", title: "Introducing Contra Payments", date: "Feb 2026", href: "https://x.com/contraben/status/2024182864506761617" },
  { n: "04", title: "Introducing Creative Arena", date: "Sep 2025", href: "https://x.com/contraben/status/1968717444685394134" },
  { n: "05", title: "Introducing Indy AI", date: "Aug 2025", href: "https://x.com/contraben/status/1952725885146075406" },
  { n: "06", title: "Contra Reaches 1M Users", date: "May 2025", href: "https://x.com/contraben/status/1918053299443401127" },
  { n: "07", title: "Contra for Companies", date: "Feb 2024", id: "911709177" },
  { n: "08", title: "Portfolio Magic", date: "Jun 2023", id: "835482460" },
  { n: "09", title: "Portfolios on Contra", date: "Feb 2023", id: "798573043" },
  { n: "10", title: "Contra Global Payments", date: "Feb 2022", id: "720360443", hash: "f1e9a9b4cf" },
  { n: "11", title: "Contra Payments", date: "Nov 2021", id: "639299621" },
  { n: "12", title: "State of Independence", date: "Jun 2021", id: "562895784" },
  { n: "13", title: "Contra’s First Launch", date: "Feb 2021", id: "495381947" },
];

const investments = [
  ["Spline", "https://spline.design", "Seed+", "2024"], ["Paper", "https://paper.design", "Seed", "2025"],
  ["MagicPath", "https://magicpath.ai", "Seed", "2026"], ["Flora", "https://flora.ai", "Seed", "2025"],
  ["Wajo", "https://wajo.ai", "Seed", "2026"], ["Aerial Intelligence", "", "Seed", "2026"],
  ["Kled", "https://kled.ai", "Seed", "2026"], ["Instant", "https://instant.so", "Seed", "2026"],
  ["Varg.ai", "https://varg.ai", "Seed", "2026"], ["Constellation AI", "", "Pre-seed", "2026"],
  ["Acctual", "https://acctual.com", "Seed", "2025"],
];

const research = [
  { n: "01", title: "TASTE: Preference Dataset for Graphic Design", meta: "2026 · Paper · arXiv", stats: "", href: "https://arxiv.org/abs/2605.20731" },
  { n: "02", title: "The Human Creativity Benchmark", meta: "2026 · Paper · arXiv", stats: "", href: "https://arxiv.org/abs/2606.30561" },
  { n: "03", title: "Contra Labs Research", meta: "Ongoing · Research", stats: "", href: "https://contralabs.com/research" },
  { n: "04", title: "Ad Creative Design Dataset", meta: "Dataset · Hugging Face", stats: "85 downloads · 35 rows", href: "https://huggingface.co/datasets/contralabs/creative-ad-design-dataset" },
  { n: "05", title: "Descript Video-Editing Trajectories", meta: "Dataset · Hugging Face", stats: "286 downloads · 803 rows", href: "https://huggingface.co/datasets/contralabs/descript-video-editing-trajectories" },
  { n: "06", title: "Premiere Video-Editing Trajectories", meta: "Dataset · Hugging Face", stats: "686 downloads · 234 rows", href: "https://huggingface.co/datasets/contralabs/premiere-video-editing-trajectories" },
  { n: "07", title: "Video Detail Annotation", meta: "Dataset · Hugging Face", stats: "387 downloads · 15 rows", href: "https://huggingface.co/datasets/contralabs/video-detail-annotation" },
  { n: "08", title: "Human Creativity Benchmark", meta: "Dataset · Hugging Face", stats: "265 downloads · 8,012 rows", href: "https://huggingface.co/datasets/contralabs/HumanCreativityBenchmark" },
  { n: "09", title: "Photoshop Creative Design Trajectories", meta: "Dataset · Hugging Face", stats: "230 downloads · 294 rows", href: "https://huggingface.co/datasets/contralabs/photoshop-creative-design-trajectories" },
  { n: "10", title: "Gemini Creative Campaign Trajectories", meta: "Dataset · Hugging Face", stats: "183 downloads · 266 rows", href: "https://huggingface.co/datasets/contralabs/gemini-creative-campaign-trajectories" },
  { n: "11", title: "Firefly Creative Campaign Trajectories", meta: "Dataset · Hugging Face", stats: "125 downloads · 137 rows", href: "https://huggingface.co/datasets/contralabs/firefly-creative-campaign-trajectories" },
];

function ContraMark() {
  return <svg className="contra-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M8.528 4.13A20.95 20.95 0 0 1 4.085 8.554 24.23 24.23 0 0 1 0 10.609v.404h10.996V.011h-.387a24.54 24.54 0 0 1-2.081 4.12Zm4.465-4.119v11.048h10.996v-.403a24.11 24.11 0 0 1-4.085-2.055 20.83 20.83 0 0 1-4.442-4.423A24.34 24.34 0 0 1 13.364.011h-.371Zm10.996 12.94H12.993V24h.371a24.37 24.37 0 0 1 2.098-4.167 20.83 20.83 0 0 1 4.442-4.423 24.1 24.1 0 0 1 4.085-2.055v-.404ZM10.996 24V12.999H0v.403a24.23 24.23 0 0 1 4.086 2.055 20.96 20.96 0 0 1 4.442 4.424A24.55 24.55 0 0 1 10.609 24h.387Z" /></svg>;
}

function ContraLogo({ labs = false }: { labs?: boolean }) {
  if (labs) return <svg className="brand-logo labs-logo" viewBox="0 0 120 15" role="img" aria-label="Contra Labs"><path fill="currentColor" d="M115.144 1.841c2.912 0 4.711 1.486 4.856 4.064h-2.285c-.144-1.503-1.097-2.202-2.535-2.202-1.457 0-2.212.663-2.212 1.701 0 .913.558 1.378 1.673 1.611l2.247.519c2.14.467 3.111 1.63 3.111 3.563 0 2.363-1.978 3.903-4.676 3.903-2.984 0-4.962-1.63-4.979-4.243h2.282c.018 1.467 1.134 2.38 2.734 2.38 1.42 0 2.354-.716 2.354-1.897 0-.931-.432-1.469-1.671-1.755l-2.391-.519c-1.943-.429-2.967-1.611-2.967-3.384 0-2.166 1.78-3.741 4.459-3.741ZM63.845 1.842c2.64 0 4 1.417 4 3.415v5.849c0 .658.259 1.175 1.038 1.175.376 0 .729-.141 1.06-.399l.165.166c-.377.845-1.226 2.396-3.346 2.396-1.339 0-2.371-.847-2.61-2.059-.58 1.082-1.985 2.092-3.816 2.092-1.634 0-3.027-.788-3.027-2.54 0-2.287 2.662-3.703 5.149-4.706 1.06-.428 1.537-.865 1.537-1.691-.049-.697-.429-1.264-1.13-1.423-.752-.172-1.537-.037-2.226.289-.349.166-.666.388-.981.61-.259.184-.863.757-.878.771l-.204-.205c.282-.866 1.38-3.741 5.269-3.741Zm.16 5.19c-.273.875-2.919 1.379-2.92 3.325 0 .99.616 1.521 1.796 1.521.395 0 .863-.151 1.124-.331V7.032ZM45.241 2.523h2.74l-.395 1.21h-2.344v7.344c0 1.34.731 1.787 1.697 1.787.943 0 1.446-.377 1.5-.43l.185.187c-.542 1.034-1.898 2.076-3.854 2.076s-3.347-.94-3.347-3.361V3.733h-1.368V3.46L44.983 0h.259v2.523ZM18.923 1.841c3.488 0 6.623 2.633 6.623 6.275 0 3.643-3.159 6.277-6.623 6.277-3.463 0-6.598-2.68-6.598-6.277 0-3.595 3.134-6.275 6.598-6.275Zm.001 1.184c-1.767 0-2.569 2.04-2.569 5.092 0 3.051.85 5.114 2.594 5.114 1.767 0 2.568-2.106 2.568-5.115 0-3.008-.825-5.091-2.593-5.091ZM79.24 12.386h5.395v2.077h-7.607V1.841h2.212v10.545ZM6.839 1.262c2.605 0 4.427 1.73 4.427 1.73l-1.08 3.395-.207-.012c-.838-1.749-2.015-4.008-3.68-4.008-1.272 0-2.379 1.496-2.379 3.951 0 3.504 1.794 4.888 3.922 4.888 1.22 0 2.311-.398 2.909-1.041l.223.133c-.669 2.218-2.461 3.697-5.211 3.697C2.344 13.995 0 11.61 0 7.914 0 4.004 2.822 1.263 6.839 1.263ZM94.984 14.463l-1.206-3.224H88.6l-1.204 3.224h-2.357l4.963-12.622h2.373l4.981 12.622h-2.372Zm-4.856-7.27-.773 2.059h3.668l-.773-2.059-1.061-2.899-1.06 2.899ZM104.193 1.841c2.336 0 3.865 1.343 3.865 3.384 0 1.199-.63 2.147-1.746 2.577 1.313.394 2.07 1.541 2.07 3.117 0 2.164-1.494 3.544-3.884 3.544h-5.521V1.841h5.216Zm-3.004 10.777h2.967c1.222 0 1.941-.716 1.941-1.898 0-1.181-.737-1.896-1.941-1.896h-2.967v3.794Zm0-5.55h2.715c1.133 0 1.87-.68 1.87-1.701 0-1.038-.737-1.681-1.87-1.682h-2.715v3.383ZM30.925 4.279c.929-1.448 2.541-2.318 4.266-2.303 2.17 0 3.631 1.292 3.632 3.383v4.372c0 2.139.189 3.149.636 4.395v.047h-5.091v-.048c.447-1.245.636-2.28.636-4.346V5.938c0-1.01-.488-1.93-1.697-1.93-1.208 0-1.969.854-2.264 1.612v4.135c0 2.045.189 3.126.612 4.373v.045h-5.09v-.045c.424-1.223.661-2.211.661-4.398V7.31c0-1.881-.402-2.939-1.345-4.02v-.045l5.044-1.387v2.42ZM54.017 4.595c.344-1.628 2.116-3.129 4.686-2.466l-1.109 3.532h-.178c-1.505-1.65-3.048-1.375-3.282.009v4.065c0 2.044.19 3.124.614 4.368v.048h-5.09v-.047c.424-1.221.66-2.209.66-4.393v-2.42c0-1.878-.377-2.936-1.343-4.017v-.047l5.041-1.386v2.754Z"/></svg>;
  return <svg className="brand-logo contra-logo" viewBox="0 0 136 24" role="img" aria-label="Contra"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M8.528 4.13A20.95 20.95 0 0 1 4.085 8.554 24.23 24.23 0 0 1 0 10.609v.404h10.996V.011h-.387a24.54 24.54 0 0 1-2.081 4.12Zm4.465-4.119v11.048h10.996v-.403a24.11 24.11 0 0 1-4.085-2.055 20.83 20.83 0 0 1-4.442-4.423A24.34 24.34 0 0 1 13.364.011h-.371Zm10.996 12.94H12.993V24h.371a24.37 24.37 0 0 1 2.098-4.167 20.83 20.83 0 0 1 4.442-4.423 24.1 24.1 0 0 1 4.085-2.055v-.404ZM10.996 24V12.999H0v.403a24.23 24.23 0 0 1 4.086 2.055 20.96 20.96 0 0 1 4.442 4.424 24.55 24.55 0 0 1 2.081 4.119h.387Z"/><path fill="currentColor" d="M134.795 18.257c-.495.389-1.024.601-1.59.601-1.165 0-1.555-.777-1.555-1.768V8.282c0-3.007-2.038-5.142-5.994-5.142-5.831 0-7.478 4.327-7.9 5.632l.307.308s.923-.88 1.316-1.16c.472-.335.948-.67 1.471-.918 1.033-.491 2.21-.693 3.336-.436 1.052.24 1.621 1.093 1.694 2.143 0 1.244-.716 1.901-2.303 2.545-3.728 1.51-7.72 3.641-7.72 7.085 0 2.639 2.088 3.824 4.538 3.824 2.744 0 4.85-1.521 5.719-3.149.359 1.826 1.906 3.099 3.912 3.099 3.179 0 4.45-2.336 5.016-3.609l-.247-.247Zm-8.901-.505c-.392.272-1.091.5-1.684.5-1.767 0-2.691-.8-2.691-2.292 0-2.931 3.967-3.687 4.375-5.003v6.795ZM110.546 7.17V3.02l-7.558 2.088v.07c1.448 1.628 2.013 3.22 2.013 6.049v3.643c0 3.29-.353 4.775-.989 6.614v.071h7.628v-.071c-.635-1.875-.918-3.501-.918-6.579v-6.12c.35-2.083 2.664-2.496 4.919-.014h.267l1.661-5.316c-3.852-.997-6.509 1.262-7.024 3.713l.001.002ZM57.709 3.224c-5.195 0-9.893 4.034-9.893 9.448s4.7 9.448 9.893 9.448c5.193 0 9.928-3.964 9.928-9.448 0-5.485-4.699-9.448-9.928-9.448Zm.036 17.148c-2.614 0-3.886-3.105-3.886-7.699s1.2-7.667 3.85-7.667 3.887 3.138 3.887 7.667c0 4.529-1.2 7.699-3.851 7.699ZM99.776 19.367c-1.448 0-2.545-.672-2.545-2.689V5.621h3.514l.591-1.824H97.23V0h-.388l-7.385 5.21v.411h2.049v11.447c0 3.645 2.085 5.06 5.017 5.06 2.933 0 4.966-1.57 5.78-3.128l-.28-.28c-.081.081-.835.648-2.249.648l.002-.001ZM87.769 8.319c0-3.149-2.191-5.095-5.441-5.095s-5.441 1.91-6.396 3.468V3.046L68.371 5.134v.07c1.413 1.628 2.014 3.221 2.014 6.052v3.645c0 3.291-.353 4.778-.989 6.617v.07h7.632v-.07c-.637-1.876-.919-3.503-.919-6.582V8.711c.442-1.142 1.58-2.426 3.393-2.426 1.812 0 2.544 1.384 2.544 2.904v5.781c0 3.114-.283 4.671-.954 6.547v.07h7.632v-.07c-.671-1.876-.954-3.398-.954-6.617V8.318l-.001.001ZM39.15 4.656c2.496 0 4.259 3.402 5.517 6.035l.31.018 1.618-5.112s-2.73-2.604-6.636-2.604c-6.021 0-10.251 4.128-10.251 10.015 0 5.565 3.513 9.155 8.638 9.155 4.122 0 6.81-2.225 7.813-5.564l-.336-.201c-.897.969-2.532 1.565-4.36 1.565-3.19 0-5.879-2.082-5.879-7.359 0-3.696 1.658-5.947 3.566-5.947v-.001Z"/></svg>;
}

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className={`external ${className}`}>{children} <ExternalArrow /></a>;
}

function Navigation({ active, citySwitcher, onNavigate }: { active: string; citySwitcher: React.ReactNode; onNavigate: (section: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [marquee, setMarquee] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const sectionNavRef = useRef<HTMLDivElement>(null);
  const sectionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lensRef = useRef<HTMLSpanElement>(null);
  const lensCausticRef = useRef<HTMLSpanElement>(null);
  const lensMotionRef = useRef({ x: 0, width: 0, velocityX: 0, velocityWidth: 0, targetX: 0, targetWidth: 0, pendingWidth: 0, widthAt: 0, last: 0, frame: 0, ready: false });
  const paintLens = () => {
    const lens = lensRef.current, motion = lensMotionRef.current;
    if (!lens) return;
    const stretch = 1 + Math.min(Math.abs(motion.velocityX) * .00008, .04);
    const skew = Math.max(-1.5, Math.min(1.5, motion.velocityX * .003));
    lens.style.width = `${motion.width}px`;
    lens.style.transform = `translate3d(${motion.x}px,0,0) scaleX(${stretch}) skewX(${skew}deg)`;
  };
  const startLensSpring = () => {
    const motion = lensMotionRef.current;
    if (motion.frame) return;
    const tick = (time: number) => {
      const state = lensMotionRef.current;
      const dt = Math.min((time - (state.last || time)) / 1000, .032);
      state.last = time;
      if (time >= state.widthAt) state.targetWidth = state.pendingWidth;
      const stiffness = 48, damping = 14, mass = 1.2;
      const accelerationX = (stiffness * (state.targetX - state.x) - damping * state.velocityX) / mass;
      const accelerationWidth = (stiffness * (state.targetWidth - state.width) - damping * state.velocityWidth) / mass;
      state.velocityX += accelerationX * dt;
      state.velocityWidth += accelerationWidth * dt;
      state.x += state.velocityX * dt;
      state.width += state.velocityWidth * dt;
      paintLens();
      const settled = Math.abs(state.targetX - state.x) < .08 && Math.abs(state.targetWidth - state.width) < .08 && Math.abs(state.velocityX) < .12 && Math.abs(state.velocityWidth) < .12 && time >= state.widthAt;
      if (settled) {
        state.x = state.targetX;
        state.width = state.targetWidth;
        state.velocityX = 0;
        state.velocityWidth = 0;
        state.frame = 0;
        state.last = 0;
        paintLens();
        return;
      }
      state.frame = requestAnimationFrame(tick);
    };
    motion.frame = requestAnimationFrame(tick);
  };
  useLayoutEffect(() => {
    const container = sectionNavRef.current, button = sectionButtonRefs.current[active];
    if (!container || !button) return;
    const motion = lensMotionRef.current;
    const measure = (immediate = false) => {
      const targetX = button.offsetLeft, targetWidth = button.offsetWidth;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!motion.ready || immediate || reducedMotion) {
        motion.x = targetX;
        motion.width = targetWidth;
        motion.targetX = targetX;
        motion.targetWidth = targetWidth;
        motion.pendingWidth = targetWidth;
        motion.velocityX = 0;
        motion.velocityWidth = 0;
        motion.widthAt = 0;
        motion.ready = true;
        paintLens();
        return;
      }
      motion.targetX = targetX;
      motion.pendingWidth = targetWidth;
      motion.widthAt = performance.now() + 70;
      startLensSpring();
    };
    measure();
    let observedWidth = container.offsetWidth;
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.offsetWidth;
      if (Math.abs(nextWidth - observedWidth) < .5) return;
      observedWidth = nextWidth;
      measure(true);
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [active]);
  useEffect(() => () => {
    if (lensMotionRef.current.frame) cancelAnimationFrame(lensMotionRef.current.frame);
  }, []);
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 16);
      setMarquee(window.innerWidth <= 820 || window.scrollY > 120);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const sectionIndex = sections.indexOf(active);
      const section = document.getElementById(active);
      if (!section || sectionIndex < 0) return;
      const next = document.getElementById(sections[sectionIndex + 1] ?? "");
      const start = section.offsetTop;
      const end = next?.offsetTop ?? document.documentElement.scrollHeight;
      const readingLine = window.scrollY + window.innerHeight * .34;
      const progress = Math.max(0, Math.min(1, (readingLine - start) / Math.max(1, end - start)));
      headerRef.current?.style.setProperty("--section-progress", `${(progress * 100).toFixed(1)}%`);
    };
    const scheduleProgress = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
    };
  }, [active]);
  const moveGlassHighlight = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const surface = event.currentTarget.querySelector<HTMLElement>(".nav-shell");
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    event.currentTarget.style.setProperty("--glass-x", `${x.toFixed(1)}%`);
    event.currentTarget.style.setProperty("--glass-y", `${y.toFixed(1)}%`);
  };
  const resetGlassHighlight = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--glass-x", "50%");
    event.currentTarget.style.setProperty("--glass-y", "-20%");
  };
  const moveLensCaustic = (event: React.PointerEvent<HTMLDivElement>) => {
    const lens = lensRef.current, caustic = lensCausticRef.current;
    if (!lens || !caustic || event.pointerType === "touch") return;
    const rect = lens.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width)));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height)));
    caustic.style.transform = `translate3d(${((x - .5) * 18).toFixed(2)}px,${((y - .5) * 7).toFixed(2)}px,0)`;
  };
  const resetLensCaustic = () => {
    if (lensCausticRef.current) lensCausticRef.current.style.transform = "translate3d(0,0,0)";
    sectionNavRef.current?.classList.remove("is-pressing");
  };
  const navigate = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    onNavigate(sectionId);
    history.pushState(null, "", `#${sectionId}`);
    if (sectionId === "about") {
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    const target = sectionId === "contra"
      ? section.querySelector<HTMLElement>(".section-label")
      : section.querySelector<HTMLElement>(".section-head");
    if (!target) return;
    const navHeight = headerRef.current?.getBoundingClientRect().height ?? 66;
    const projectedMarqueeHeight = 52;
    const breathingRoom = window.innerWidth <= 700 ? 24 : 36;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - projectedMarqueeHeight - breathingRoom;
    window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const sectionNavigation = <div ref={sectionNavRef} className="section-liquid-fallback" aria-label="Primary navigation" onPointerMove={moveLensCaustic} onPointerLeave={resetLensCaustic} onPointerUp={() => sectionNavRef.current?.classList.remove("is-pressing")}>
    <span ref={lensRef} className="section-liquid-lens" aria-hidden="true"><span className="section-liquid-lens-surface"><span ref={lensCausticRef} className="section-liquid-caustic" /></span></span>
    {sections.map(section => <button ref={node => { sectionButtonRefs.current[section] = node; }} key={section} type="button" className={active === section ? "active" : ""} aria-current={active === section ? "page" : undefined} onPointerDown={() => sectionNavRef.current?.classList.add("is-pressing")} onClick={() => navigate(section)}>{section[0].toUpperCase() + section.slice(1)}</button>)}
  </div>;
  return <header ref={headerRef} className={`nav-wrap${scrolled ? " is-scrolled" : ""}${marquee ? " has-marquee" : ""}`} onPointerMove={moveGlassHighlight} onPointerLeave={resetGlassHighlight}>
    <div className="nav-shell">
      <div className="nav-links">
        {sectionNavigation}
      </div>
      {citySwitcher}
    </div>
  </header>;
}

function ProjectRow({ item }: { item: Project }) {
  const [open, setOpen] = useState(false);
  if (item.href) return <div className="project project-link">
    <a className="project-row" data-space-effect="orbit" href={item.href} target="_blank" rel="noreferrer">
      <span className="mono">{item.n}</span><span className="project-title">{item.title}</span><span className="mono date">{item.date}</span><span className="toggle external-toggle" aria-hidden="true"><ExternalArrow /></span>
    </a>
  </div>;
  const src = `https://player.vimeo.com/video/${item.id ?? ""}${item.hash ? `?h=${item.hash}` : ""}`;
  return <div className={`project ${open ? "is-open" : ""}`}>
    <button className="project-row" data-space-effect="frame" onClick={(event) => {
      const next = !open, rect = event.currentTarget.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent("space-interaction", { detail: { type: "project", x: rect.left + rect.width * .62, y: rect.top + rect.height * .5, open: next } }));
      setOpen(next);
    }} aria-expanded={open}>
      <span className="mono">{item.n}</span><span className="project-title">{item.title}</span><span className="mono date">{item.date}</span><span className="toggle">{open ? "−" : "+"}</span>
    </button>
    <div className="video-shell">{open && <div className="video"><iframe src={src} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={item.title} loading="lazy" /></div>}</div>
  </div>;
}

const loaderSegments = Array.from({ length: 48 }, (_, index) => index);

function SiteLoader({ mode }: { mode: EnvironmentMode }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const modeDetails = mode === "sf"
    ? { name: "San Francisco", coordinates: "37.7749° N · 122.4194° W" }
    : mode === "space"
      ? { name: "Space", coordinates: "Low Earth Orbit · 408 km" }
      : { name: "New York", coordinates: "40.7128° N · 74.0060° W" };

  useLayoutEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || sessionStorage.getItem("ben-loader-seen") === "1") {
      setVisible(false);
      return;
    }

    root.classList.add("loader-active");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let frame = 0;
    let cancelled = false;
    const started = performance.now();
    const minimumDuration = 1500;

    const readiness = Promise.race([
      Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise<void>(resolve => window.setTimeout(resolve, 900)),
      ]),
      new Promise<void>(resolve => window.setTimeout(resolve, 2000)),
    ]);

    const animateProgress = (now: number) => {
      const elapsed = now - started;
      const eased = 1 - Math.pow(1 - Math.min(elapsed / 1650, 1), 3);
      setProgress(Math.min(94, Math.round(eased * 94)));
      if (!cancelled && elapsed < minimumDuration) frame = requestAnimationFrame(animateProgress);
    };
    frame = requestAnimationFrame(animateProgress);

    Promise.all([
      readiness,
      new Promise<void>(resolve => window.setTimeout(resolve, minimumDuration)),
    ]).then(() => {
      if (cancelled) return;
      cancelAnimationFrame(frame);
      setProgress(100);
      window.setTimeout(() => {
        if (cancelled) return;
        const loaderTitle = titleRef.current;
        const heroTitle = document.querySelector<HTMLElement>("#about h1");
        setExiting(true);
        root.classList.add("loader-revealing");
        if (loaderTitle && heroTitle) {
          const from = loaderTitle.getBoundingClientRect();
          const to = heroTitle.getBoundingClientRect();
          loaderTitle.animate([
            { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
            { transform: `translate3d(${to.left - from.left}px,${to.top - from.top}px,0) scale(${to.width / Math.max(from.width, 1)})`, opacity: 1, offset: .76 },
            { transform: `translate3d(${to.left - from.left}px,${to.top - from.top}px,0) scale(${to.width / Math.max(from.width, 1)})`, opacity: 0 },
          ], { duration: 1050, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
        }
        window.setTimeout(() => {
          sessionStorage.setItem("ben-loader-seen", "1");
          root.classList.remove("loader-active", "loader-revealing");
          document.body.style.overflow = previousOverflow;
          setVisible(false);
        }, 1120);
      }, 260);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      root.classList.remove("loader-active", "loader-revealing");
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!visible) return null;
  const illuminated = Math.ceil((progress / 100) * loaderSegments.length);
  return <div className={`site-loader mode-${mode}${exiting ? " is-exiting" : ""}`} role="status" aria-live="polite" aria-label={`Loading Ben Huffman's site, ${progress}%`}>
    <div className="site-loader-surface" />
    <div className="site-loader-grid">
      <div className="site-loader-top mono">
        <span>Ben Huffman</span>
        <div className="site-loader-rail" aria-hidden="true">
          {loaderSegments.map(index => <i key={index} className={index < illuminated ? "is-lit" : ""} />)}
        </div>
        <span className="site-loader-count">{progress}%</span>
      </div>
      <div className="site-loader-calibration mono">
        <span>Calibrating {modeDetails.name}</span>
        <span>{modeDetails.coordinates}</span>
      </div>
      <div className="site-loader-pulses" aria-hidden="true"><i /><i /><i /></div>
      <div ref={titleRef} className="site-loader-title" aria-hidden="true">Hey, I’m Ben<span className="serif">.</span></div>
    </div>
  </div>;
}

function HeroTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const portraitRef = useRef<HTMLSpanElement>(null);
  const portraitCycleRef = useRef(0);
  const frameRef = useRef(0);
  const shineFrameRef = useRef(0);
  const trackShine = (event: React.PointerEvent<HTMLHeadingElement>) => {
    if (event.pointerType === "touch") return;
    const title = titleRef.current;
    if (!title) return;
    const bounds = title.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 100));
    cancelAnimationFrame(shineFrameRef.current);
    shineFrameRef.current = requestAnimationFrame(() => {
      title.style.setProperty("--shine-x", `${x.toFixed(2)}%`);
      title.style.setProperty("--shine-y", `${y.toFixed(2)}%`);
    });
  };
  const resetShine = () => {
    cancelAnimationFrame(shineFrameRef.current);
    titleRef.current?.style.setProperty("--shine-x", "50%");
    titleRef.current?.style.setProperty("--shine-y", "50%");
  };
  const trackPortrait = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === "touch") return;
    const portrait = portraitRef.current;
    if (!portrait) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - .5) * 28;
    const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - .5) * 16;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      portrait.style.setProperty("--portrait-x", `${x.toFixed(2)}px`);
      portrait.style.setProperty("--portrait-y", `${y.toFixed(2)}px`);
      portrait.style.setProperty("--portrait-rotate", `${(x * .055).toFixed(2)}deg`);
    });
  };
  const showPortrait = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === "touch") return;
    const portrait = portraitRef.current;
    if (!portrait) return;
    portrait.dataset.portrait = String(portraitCycleRef.current % 2);
    portraitCycleRef.current += 1;
    portrait.classList.add("is-visible");
    trackPortrait(event);
  };
  const hidePortrait = () => {
    cancelAnimationFrame(frameRef.current);
    const portrait = portraitRef.current;
    if (!portrait) return;
    portrait.classList.remove("is-visible");
    portrait.style.setProperty("--portrait-x", "0px");
    portrait.style.setProperty("--portrait-y", "0px");
    portrait.style.setProperty("--portrait-rotate", "0deg");
  };
  return <h1 ref={titleRef} className="hero-title" onPointerMove={trackShine} onPointerLeave={resetShine}>Hey, <span className="ben-hover" onPointerEnter={showPortrait} onPointerMove={trackPortrait} onPointerLeave={hidePortrait}><span className="ben-hover-label">I’m Ben<span className="serif">.</span></span><span ref={portraitRef} className="ben-portrait" data-portrait="0" aria-hidden="true"><img className="ben-portrait-image ben-portrait-current" src="/images/ben-headshot.jpeg" alt="" /><img className="ben-portrait-image ben-portrait-colorbar" src="/images/ben-headshot-colorbar.jpg" alt="" /></span></span></h1>;
}

function PhilosophyRibbon() {
  const ribbonRef = useRef<HTMLElement>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    setQuoteIndex(getDailyQuoteIndex());
    const timer = window.setInterval(() => setQuoteIndex(getDailyQuoteIndex()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const ribbon = ribbonRef.current;
    const root = document.documentElement;
    if (!ribbon) return;
    const observer = new IntersectionObserver(([entry]) => {
      root.classList.toggle("daily-thought-visible", entry.isIntersecting);
    }, { threshold: .08 });
    observer.observe(ribbon);
    return () => {
      observer.disconnect();
      root.classList.remove("daily-thought-visible");
    };
  }, []);
  const quote = philosophicalQuotes[quoteIndex];
  const run = (duplicate = false) => <div className="philosophy-ribbon-run" aria-hidden={duplicate || undefined}>
    <span className="philosophy-ribbon-index mono">Daily thought</span>
    <span className="philosophy-ribbon-divider" aria-hidden />
    <strong>“{quote.quote}”</strong>
    <span className="philosophy-ribbon-author mono">— {quote.author} · {quote.source}</span>
    <span className="philosophy-ribbon-year mono">{formatQuoteYear(quote.year)}</span>
  </div>;
  return <aside
    ref={ribbonRef}
    className="philosophy-ribbon"
    aria-label={`Daily philosophical thought: ${quote.quote} — ${quote.author}, ${quote.source}, ${formatQuoteYear(quote.year)}`}
  >
    <div className="philosophy-ribbon-motion">
      <div key={quoteIndex} className="philosophy-ribbon-track">
        {run()}
        {run(true)}
      </div>
    </div>
  </aside>;
}

export default function Home() {
  const [active, setActive] = useState("about");
  const [mode, setModeState] = useState<EnvironmentMode>("space");
  const [spaceLoaded, setSpaceLoaded] = useState(true);
  const { city, setCity, weather, atmosphere, now } = useCityAtmosphere();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: "-20% 0px -65%" });
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".hero > *, .statement > *, .section-head, .research-row, .index-head, .index-row, .project, .socials > a, footer > *"));
    targets.forEach((target, index) => {
      target.classList.add("motion-item");
      if (target.matches(".research-row,.index-row,.project")) target.classList.add("motion-row");
      target.style.setProperty("--motion-delay", `${Math.min(index % 5, 4) * 34}ms`);
    });
    root.classList.add("motion-ready");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { rootMargin: "0px 0px -7%", threshold: .06 });
    targets.forEach(target => observer.observe(target));
    return () => { observer.disconnect(); root.classList.remove("motion-ready"); };
  }, []);
  useEffect(()=>{const saved=localStorage.getItem("environmentModeV2");if(saved==="sf"||saved==="ny"||saved==="space"){setModeState(saved);if(saved==="sf")setCity("SF");if(saved==="ny")setCity("NY");if(saved==="space")setSpaceLoaded(true)}},[]);
  const setMode=(next:EnvironmentMode)=>{setModeState(next);localStorage.setItem("environmentModeV2",next);if(next==="space")setSpaceLoaded(true)};
  useEffect(()=>{const root=document.documentElement;if(mode==="space"){root.classList.add("space-mode");root.style.setProperty("--ink","#f1f0ea");root.style.setProperty("--line","rgba(241,240,234,.18)");root.style.setProperty("--nav-bg","rgba(1,4,12,.88)");root.style.setProperty("--telemetry-card-bg","rgb(12 29 57 / 92%)");root.style.setProperty("--telemetry-card-text","#f3f0e8");root.style.setProperty("--telemetry-card-border","rgb(243 240 232 / 22%)");root.style.setProperty("--telemetry-ribbon-bg","rgb(12 29 57 / 97%)");root.style.setProperty("--telemetry-ribbon-text","#f3f0e8")}else{root.classList.remove("space-mode");root.style.setProperty("--ink",atmosphere.foreground);root.style.setProperty("--line",atmosphere.line);root.style.setProperty("--nav-bg",atmosphere.nav);root.style.setProperty("--telemetry-card-bg",atmosphere.telemetry.cardBg);root.style.setProperty("--telemetry-card-text",atmosphere.telemetry.cardText);root.style.setProperty("--telemetry-card-border",atmosphere.telemetry.cardBorder);root.style.setProperty("--telemetry-ribbon-bg",atmosphere.telemetry.ribbonBg);root.style.setProperty("--telemetry-ribbon-text",atmosphere.telemetry.ribbonText)}},[mode,atmosphere]);

  return <>
    <AtmosphereBackground atmosphere={atmosphere} />
    {spaceLoaded&&<Suspense fallback={null}><SpaceView active={mode==="space"}/></Suspense>}
    <SiteLoader mode={mode} />
    <Navigation active={active} onNavigate={setActive} citySwitcher={<CitySwitcher city={city} setCity={setCity} weather={weather} mode={mode} onMode={setMode} onPreloadSpace={()=>import("./space-view")} now={now} />} />
    <main>
      <section id="about" className="hero reveal">
        <div className="hero-topline"><p className="eyebrow mono">Ben Huffman · Founder × Creative Researcher × Angel Investor</p></div>
        <HeroTitle />
        <p className="dek">I’m a creative builder, entrepreneur, and angel investor.</p>
        <div className="hero-socials" aria-label="Social links">
          <a href="https://x.com/contraben" target="_blank" rel="noreferrer" data-space-effect="orbit" aria-label="Ben Huffman on X"><span aria-hidden>X</span></a>
          <a href="https://www.linkedin.com/in/ben-huffman-b7b6a8102/" target="_blank" rel="noreferrer" data-space-effect="orbit" aria-label="Ben Huffman on LinkedIn"><span className="linkedin-icon" aria-hidden>in</span></a>
          <a href="https://contra.com/ben" target="_blank" rel="noreferrer" data-space-effect="orbit" aria-label="Ben Huffman on Contra"><ContraMark /></a>
        </div>
      </section>

      <section id="contra" className="statement reveal">
        <p className="section-label mono">01 / Currently</p>
        <p className="large-copy">I am building <ExternalLink href="https://contra.com/">Contra</ExternalLink> and <ExternalLink href="https://contra.com/labs">Contra Labs</ExternalLink> to help creativity meet opportunity. Contra supports millions of users globally earning hundreds of millions of dollars every year.</p>
        <div className="link-pair">
          <a href="https://contra.com/" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong><ContraLogo /><ExternalArrow /></strong><span>Independent work infrastructure</span></a>
          <a href="https://contra.com/labs" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong><ContraLogo labs /><ExternalArrow /></strong><span>Human data + RL infrastructure for creative AI</span></a>
        </div>
      </section>

      <section id="research" className="reveal">
        <div className="section-head"><p className="section-label mono">02 / Research + data</p><h2>Research</h2></div>
        <div className="research-list">{research.map(r => <a href={r.href} target="_blank" rel="noreferrer" key={r.n} className="research-row" data-space-effect="orbit"><span className="mono">{r.n}</span><strong>{r.title}</strong><span className="research-meta mono"><span>{r.meta} <ExternalArrow /></span>{r.stats && <span className="research-stats">{r.stats}</span>}</span></a>)}</div>
      </section>

      <section id="investments" className="reveal">
        <div className="section-head"><p className="section-label mono">03 / Angel portfolio</p><h2>Investments</h2></div>
        <div className="index investments"><div className="index-head mono"><span>Company</span><span>Stage</span><span>Year</span></div>{investments.map(([name, href, stage, year]) => <div className="index-row" key={name}><span>{href ? <ExternalLink href={href}>{name}</ExternalLink> : name}</span><span>{stage}</span><span className="mono">{year}</span></div>)}</div>
      </section>

      <section id="projects" className="reveal">
        <div className="section-head"><p className="section-label mono">04 / Selected work</p><h2>Projects</h2></div>
        <div className="project-list">{projects.map(p => <ProjectRow key={p.n} item={p} />)}</div>
      </section>

      <section id="contact" className="reveal contact">
        <div className="section-head"><p className="section-label mono">05 / Get in touch</p><h2>Contact</h2></div>
        <div className="socials">
          <a href="https://x.com/contraben" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong>X <ExternalArrow /></strong><span>x.com/contraben</span></a>
          <a href="https://www.linkedin.com/in/ben-huffman-b7b6a8102/" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong>LinkedIn <ExternalArrow /></strong><span>linkedin.com/in/ben-huffman-b7b6a8102</span></a>
          <a href="https://contra.com/ben" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong>Contra <ExternalArrow /></strong><span>contra.com/ben</span></a>
        </div>
      </section>
    </main>
    <footer><strong>Ben Huffman</strong><span className="mono">© 2026</span><a href="#about">Back to top ↑</a></footer>
    <PhilosophyRibbon />
  </>;
}
