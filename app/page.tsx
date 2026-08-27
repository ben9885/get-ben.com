"use client";

import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { AtmosphereBackground, CitySwitcher, useCityAtmosphere, type EnvironmentMode } from "./atmosphere";

const sections = ["about", "contra", "research", "investments", "projects", "contact"];
const SpaceView = lazy(() => import("./space-view"));

const projects = [
  { n: "01", title: "Contra’s First Launch", date: "Feb 2021", id: "495381947" },
  { n: "02", title: "State of Independence", date: "Jun 2021", id: "562895784" },
  { n: "03", title: "Contra Payments", date: "Nov 2021", id: "639299621" },
  { n: "04", title: "Contra Global Payments", date: "Feb 2022", id: "720360443", hash: "f1e9a9b4cf" },
  { n: "05", title: "Portfolios on Contra", date: "Feb 2023", id: "798573043" },
  { n: "06", title: "Portfolio Magic", date: "Jun 2023", id: "835482460" },
  { n: "07", title: "Contra for Companies", date: "Feb 2024", id: "911709177" },
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
  { n: "03", title: "Contra Labs Research", meta: "Ongoing · Research", stats: "", href: "https://contra.com/labs" },
  { n: "04", title: "Ad Creative Design Dataset", meta: "Dataset · Hugging Face", stats: "85 downloads · 35 rows", href: "https://huggingface.co/datasets/contralabs/creative-ad-design-dataset" },
  { n: "05", title: "Descript Video-Editing Trajectories", meta: "Dataset · Hugging Face", stats: "286 downloads · 803 rows", href: "https://huggingface.co/datasets/contralabs/descript-video-editing-trajectories" },
  { n: "06", title: "Premiere Video-Editing Trajectories", meta: "Dataset · Hugging Face", stats: "686 downloads · 234 rows", href: "https://huggingface.co/datasets/contralabs/premiere-video-editing-trajectories" },
  { n: "07", title: "Video Detail Annotation", meta: "Dataset · Hugging Face", stats: "387 downloads · 15 rows", href: "https://huggingface.co/datasets/contralabs/video-detail-annotation" },
  { n: "08", title: "Human Creativity Benchmark", meta: "Dataset · Hugging Face", stats: "265 downloads · 8,012 rows", href: "https://huggingface.co/datasets/contralabs/HumanCreativityBenchmark" },
  { n: "09", title: "Photoshop Creative Design Trajectories", meta: "Dataset · Hugging Face", stats: "230 downloads · 294 rows", href: "https://huggingface.co/datasets/contralabs/photoshop-creative-design-trajectories" },
  { n: "10", title: "Gemini Creative Campaign Trajectories", meta: "Dataset · Hugging Face", stats: "183 downloads · 266 rows", href: "https://huggingface.co/datasets/contralabs/gemini-creative-campaign-trajectories" },
  { n: "11", title: "Firefly Creative Campaign Trajectories", meta: "Dataset · Hugging Face", stats: "125 downloads · 137 rows", href: "https://huggingface.co/datasets/contralabs/firefly-creative-campaign-trajectories" },
];

function Arrow() { return <span className="arrow" aria-hidden>↗</span>; }

function ContraMark() {
  return <svg className="contra-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M8.528 4.13A20.95 20.95 0 0 1 4.085 8.554 24.23 24.23 0 0 1 0 10.609v.404h10.996V.011h-.387a24.54 24.54 0 0 1-2.081 4.12Zm4.465-4.119v11.048h10.996v-.403a24.11 24.11 0 0 1-4.085-2.055 20.83 20.83 0 0 1-4.442-4.423A24.34 24.34 0 0 1 13.364.011h-.371Zm10.996 12.94H12.993V24h.371a24.37 24.37 0 0 1 2.098-4.167 20.83 20.83 0 0 1 4.442-4.423 24.1 24.1 0 0 1 4.085-2.055v-.404ZM10.996 24V12.999H0v.403a24.23 24.23 0 0 1 4.086 2.055 20.96 20.96 0 0 1 4.442 4.424A24.55 24.55 0 0 1 10.609 24h.387Z" /></svg>;
}

function ContraLogo({ labs = false }: { labs?: boolean }) {
  if (labs) return <svg className="brand-logo labs-logo" viewBox="0 0 120 15" role="img" aria-label="Contra Labs"><path fill="currentColor" d="M115.144 1.841c2.912 0 4.711 1.486 4.856 4.064h-2.285c-.144-1.503-1.097-2.202-2.535-2.202-1.457 0-2.212.663-2.212 1.701 0 .913.558 1.378 1.673 1.611l2.247.519c2.14.467 3.111 1.63 3.111 3.563 0 2.363-1.978 3.903-4.676 3.903-2.984 0-4.962-1.63-4.979-4.243h2.282c.018 1.467 1.134 2.38 2.734 2.38 1.42 0 2.354-.716 2.354-1.897 0-.931-.432-1.469-1.671-1.755l-2.391-.519c-1.943-.429-2.967-1.611-2.967-3.384 0-2.166 1.78-3.741 4.459-3.741ZM63.845 1.842c2.64 0 4 1.417 4 3.415v5.849c0 .658.259 1.175 1.038 1.175.376 0 .729-.141 1.06-.399l.165.166c-.377.845-1.226 2.396-3.346 2.396-1.339 0-2.371-.847-2.61-2.059-.58 1.082-1.985 2.092-3.816 2.092-1.634 0-3.027-.788-3.027-2.54 0-2.287 2.662-3.703 5.149-4.706 1.06-.428 1.537-.865 1.537-1.691-.049-.697-.429-1.264-1.13-1.423-.752-.172-1.537-.037-2.226.289-.349.166-.666.388-.981.61-.259.184-.863.757-.878.771l-.204-.205c.282-.866 1.38-3.741 5.269-3.741Zm.16 5.19c-.273.875-2.919 1.379-2.92 3.325 0 .99.616 1.521 1.796 1.521.395 0 .863-.151 1.124-.331V7.032ZM45.241 2.523h2.74l-.395 1.21h-2.344v7.344c0 1.34.731 1.787 1.697 1.787.943 0 1.446-.377 1.5-.43l.185.187c-.542 1.034-1.898 2.076-3.854 2.076s-3.347-.94-3.347-3.361V3.733h-1.368V3.46L44.983 0h.259v2.523ZM18.923 1.841c3.488 0 6.623 2.633 6.623 6.275 0 3.643-3.159 6.277-6.623 6.277-3.463 0-6.598-2.68-6.598-6.277 0-3.595 3.134-6.275 6.598-6.275Zm.001 1.184c-1.767 0-2.569 2.04-2.569 5.092 0 3.051.85 5.114 2.594 5.114 1.767 0 2.568-2.106 2.568-5.115 0-3.008-.825-5.091-2.593-5.091ZM79.24 12.386h5.395v2.077h-7.607V1.841h2.212v10.545ZM6.839 1.262c2.605 0 4.427 1.73 4.427 1.73l-1.08 3.395-.207-.012c-.838-1.749-2.015-4.008-3.68-4.008-1.272 0-2.379 1.496-2.379 3.951 0 3.504 1.794 4.888 3.922 4.888 1.22 0 2.311-.398 2.909-1.041l.223.133c-.669 2.218-2.461 3.697-5.211 3.697C2.344 13.995 0 11.61 0 7.914 0 4.004 2.822 1.263 6.839 1.263ZM94.984 14.463l-1.206-3.224H88.6l-1.204 3.224h-2.357l4.963-12.622h2.373l4.981 12.622h-2.372Zm-4.856-7.27-.773 2.059h3.668l-.773-2.059-1.061-2.899-1.06 2.899ZM104.193 1.841c2.336 0 3.865 1.343 3.865 3.384 0 1.199-.63 2.147-1.746 2.577 1.313.394 2.07 1.541 2.07 3.117 0 2.164-1.494 3.544-3.884 3.544h-5.521V1.841h5.216Zm-3.004 10.777h2.967c1.222 0 1.941-.716 1.941-1.898 0-1.181-.737-1.896-1.941-1.896h-2.967v3.794Zm0-5.55h2.715c1.133 0 1.87-.68 1.87-1.701 0-1.038-.737-1.681-1.87-1.682h-2.715v3.383ZM30.925 4.279c.929-1.448 2.541-2.318 4.266-2.303 2.17 0 3.631 1.292 3.632 3.383v4.372c0 2.139.189 3.149.636 4.395v.047h-5.091v-.048c.447-1.245.636-2.28.636-4.346V5.938c0-1.01-.488-1.93-1.697-1.93-1.208 0-1.969.854-2.264 1.612v4.135c0 2.045.189 3.126.612 4.373v.045h-5.09v-.045c.424-1.223.661-2.211.661-4.398V7.31c0-1.881-.402-2.939-1.345-4.02v-.045l5.044-1.387v2.42ZM54.017 4.595c.344-1.628 2.116-3.129 4.686-2.466l-1.109 3.532h-.178c-1.505-1.65-3.048-1.375-3.282.009v4.065c0 2.044.19 3.124.614 4.368v.048h-5.09v-.047c.424-1.221.66-2.209.66-4.393v-2.42c0-1.878-.377-2.936-1.343-4.017v-.047l5.041-1.386v2.754Z"/></svg>;
  return <svg className="brand-logo contra-logo" viewBox="0 0 136 24" role="img" aria-label="Contra"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M8.528 4.13A20.95 20.95 0 0 1 4.085 8.554 24.23 24.23 0 0 1 0 10.609v.404h10.996V.011h-.387a24.54 24.54 0 0 1-2.081 4.12Zm4.465-4.119v11.048h10.996v-.403a24.11 24.11 0 0 1-4.085-2.055 20.83 20.83 0 0 1-4.442-4.423A24.34 24.34 0 0 1 13.364.011h-.371Zm10.996 12.94H12.993V24h.371a24.37 24.37 0 0 1 2.098-4.167 20.83 20.83 0 0 1 4.442-4.423 24.1 24.1 0 0 1 4.085-2.055v-.404ZM10.996 24V12.999H0v.403a24.23 24.23 0 0 1 4.086 2.055 20.96 20.96 0 0 1 4.442 4.424 24.55 24.55 0 0 1 2.081 4.119h.387Z"/><path fill="currentColor" d="M134.795 18.257c-.495.389-1.024.601-1.59.601-1.165 0-1.555-.777-1.555-1.768V8.282c0-3.007-2.038-5.142-5.994-5.142-5.831 0-7.478 4.327-7.9 5.632l.307.308s.923-.88 1.316-1.16c.472-.335.948-.67 1.471-.918 1.033-.491 2.21-.693 3.336-.436 1.052.24 1.621 1.093 1.694 2.143 0 1.244-.716 1.901-2.303 2.545-3.728 1.51-7.72 3.641-7.72 7.085 0 2.639 2.088 3.824 4.538 3.824 2.744 0 4.85-1.521 5.719-3.149.359 1.826 1.906 3.099 3.912 3.099 3.179 0 4.45-2.336 5.016-3.609l-.247-.247Zm-8.901-.505c-.392.272-1.091.5-1.684.5-1.767 0-2.691-.8-2.691-2.292 0-2.931 3.967-3.687 4.375-5.003v6.795ZM110.546 7.17V3.02l-7.558 2.088v.07c1.448 1.628 2.013 3.22 2.013 6.049v3.643c0 3.29-.353 4.775-.989 6.614v.071h7.628v-.071c-.635-1.875-.918-3.501-.918-6.579v-6.12c.35-2.083 2.664-2.496 4.919-.014h.267l1.661-5.316c-3.852-.997-6.509 1.262-7.024 3.713l.001.002ZM57.709 3.224c-5.195 0-9.893 4.034-9.893 9.448s4.7 9.448 9.893 9.448c5.193 0 9.928-3.964 9.928-9.448 0-5.485-4.699-9.448-9.928-9.448Zm.036 17.148c-2.614 0-3.886-3.105-3.886-7.699s1.2-7.667 3.85-7.667 3.887 3.138 3.887 7.667c0 4.529-1.2 7.699-3.851 7.699ZM99.776 19.367c-1.448 0-2.545-.672-2.545-2.689V5.621h3.514l.591-1.824H97.23V0h-.388l-7.385 5.21v.411h2.049v11.447c0 3.645 2.085 5.06 5.017 5.06 2.933 0 4.966-1.57 5.78-3.128l-.28-.28c-.081.081-.835.648-2.249.648l.002-.001ZM87.769 8.319c0-3.149-2.191-5.095-5.441-5.095s-5.441 1.91-6.396 3.468V3.046L68.371 5.134v.07c1.413 1.628 2.014 3.221 2.014 6.052v3.645c0 3.291-.353 4.778-.989 6.617v.07h7.632v-.07c-.637-1.876-.919-3.503-.919-6.582V8.711c.442-1.142 1.58-2.426 3.393-2.426 1.812 0 2.544 1.384 2.544 2.904v5.781c0 3.114-.283 4.671-.954 6.547v.07h7.632v-.07c-.671-1.876-.954-3.398-.954-6.617V8.318l-.001.001ZM39.15 4.656c2.496 0 4.259 3.402 5.517 6.035l.31.018 1.618-5.112s-2.73-2.604-6.636-2.604c-6.021 0-10.251 4.128-10.251 10.015 0 5.565 3.513 9.155 8.638 9.155 4.122 0 6.81-2.225 7.813-5.564l-.336-.201c-.897.969-2.532 1.565-4.36 1.565-3.19 0-5.879-2.082-5.879-7.359 0-3.696 1.658-5.947 3.566-5.947v-.001Z"/></svg>;
}

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className={`external ${className}`}>{children} <Arrow /></a>;
}

function Navigation({ active, citySwitcher }: { active: string; citySwitcher: React.ReactNode }) {
  return <header className="nav-wrap"><nav aria-label="Primary"><a href="#about" className="monogram" aria-label="Ben Huffman, home">BH</a><div className="nav-links">{sections.map(s => <a key={s} href={`#${s}`} className={active === s ? "active" : ""}>{s[0].toUpperCase() + s.slice(1)}</a>)}</div>{citySwitcher}</nav></header>;
}

function ProjectRow({ item }: { item: typeof projects[number] }) {
  const [open, setOpen] = useState(false);
  const src = `https://player.vimeo.com/video/${item.id}${item.hash ? `?h=${item.hash}` : ""}`;
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

export default function Home() {
  const [active, setActive] = useState("about");
  const [mode, setModeState] = useState<EnvironmentMode>("ny");
  const [spaceLoaded, setSpaceLoaded] = useState(false);
  const { city, setCity, weather, atmosphere } = useCityAtmosphere();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: "-20% 0px -65%" });
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".hero > :not(.hero-notes), .hero-notes, .statement > *, .section-head, .subhead, .research-row, .index-head, .index-row, .project, .socials > a, footer > *"));
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
    let progressFrame = 0;
    const updateProgress = () => {
      progressFrame = 0;
      const available = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      root.style.setProperty("--page-progress", String(Math.min(1, Math.max(0, scrollY / available))));
    };
    const onScroll = () => { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); };
    const sizeObserver = new ResizeObserver(onScroll); sizeObserver.observe(document.body);
    updateProgress(); addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll, { passive: true });
    return () => { observer.disconnect(); sizeObserver.disconnect(); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); if (progressFrame) cancelAnimationFrame(progressFrame); root.classList.remove("motion-ready"); root.style.removeProperty("--page-progress"); };
  }, []);
  useEffect(()=>{const saved=localStorage.getItem("environmentMode");if(saved==="sf"||saved==="ny"||saved==="space"){setModeState(saved);if(saved==="sf")setCity("SF");if(saved==="ny")setCity("NY");if(saved==="space")setSpaceLoaded(true)}else{const preferred=localStorage.getItem("preferredCity");setModeState(preferred==="SF"?"sf":"ny")}},[]);
  const setMode=(next:EnvironmentMode)=>{setModeState(next);localStorage.setItem("environmentMode",next);if(next==="space")setSpaceLoaded(true)};
  useEffect(()=>{const root=document.documentElement;if(mode==="space"){root.classList.add("space-mode");root.style.setProperty("--ink","#f1f0ea");root.style.setProperty("--line","rgba(241,240,234,.18)");root.style.setProperty("--nav-bg","rgba(1,4,12,.88)")}else{root.classList.remove("space-mode");root.style.setProperty("--ink",atmosphere.foreground);root.style.setProperty("--line",atmosphere.line);root.style.setProperty("--nav-bg",atmosphere.nav)}},[mode,atmosphere]);

  return <>
    <AtmosphereBackground atmosphere={atmosphere} />
    {spaceLoaded&&<Suspense fallback={null}><SpaceView active={mode==="space"}/></Suspense>}
    <Navigation active={active} citySwitcher={<CitySwitcher city={city} setCity={setCity} weather={weather} mode={mode} onMode={setMode} onPreloadSpace={()=>import("./space-view")} />} />
    <main>
      <section id="about" className="hero reveal">
        <p className="eyebrow mono">Ben Huffman · Internet homepage</p>
        <h1>Hey, I’m Ben<span className="serif">.</span></h1>
        <p className="dek">I’m a creative builder, entrepreneur, and angel investor.</p>
        <div className="hero-socials" aria-label="Social links">
          <a href="https://x.com/contraben" target="_blank" rel="noreferrer" data-space-effect="orbit" aria-label="Ben Huffman on X"><span aria-hidden>X</span></a>
          <a href="https://www.linkedin.com/in/ben-huffman-b7b6a8102/" target="_blank" rel="noreferrer" data-space-effect="orbit" aria-label="Ben Huffman on LinkedIn"><span className="linkedin-icon" aria-hidden>in</span></a>
          <a href="https://contra.com/ben" target="_blank" rel="noreferrer" data-space-effect="orbit" aria-label="Ben Huffman on Contra"><ContraMark /></a>
        </div>
        <div className="hero-notes mono"><span>Founder × Creative × Researcher × Investor</span></div>
      </section>

      <section id="contra" className="statement reveal">
        <p className="section-label mono">01 / Currently</p>
        <p className="large-copy">I am building <ExternalLink href="https://contra.com/">Contra</ExternalLink> and <ExternalLink href="https://contra.com/labs">Contra Labs</ExternalLink> to help creativity meet opportunity globally. Contra supports millions of users earning $250M+ per year in 180+ countries.</p>
        <div className="link-pair">
          <a href="https://contra.com/" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong><ContraLogo /><Arrow /></strong><span>Independent work infrastructure</span></a>
          <a href="https://contra.com/labs" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong><ContraLogo labs /><Arrow /></strong><span>Human data + RL infrastructure for creative AI</span></a>
        </div>
      </section>

      <section id="research" className="reveal">
        <div className="section-head"><p className="section-label mono">02 / Research + data</p><h2>Research</h2></div>
        <div className="research-list">{research.map(r => <a href={r.href} target="_blank" rel="noreferrer" key={r.n} className="research-row" data-space-effect="orbit"><span className="mono">{r.n}</span><strong>{r.title}</strong><span className="research-meta mono"><span>{r.meta} <Arrow /></span>{r.stats && <span className="research-stats">{r.stats}</span>}</span></a>)}</div>
      </section>

      <section id="investments" className="reveal">
        <div className="section-head"><p className="section-label mono">03 / Angel portfolio</p><h2>Investments</h2></div>
        <div className="index investments"><div className="index-head mono"><span>Company</span><span>Stage</span><span>Year</span></div>{investments.map(([name, href, stage, year]) => <div className="index-row" key={name}><span>{href ? <ExternalLink href={href}>{name}</ExternalLink> : name}</span><span>{stage}</span><span className="mono">{year}</span></div>)}</div>
      </section>

      <section id="projects" className="reveal">
        <div className="section-head"><p className="section-label mono">04 / Selected work</p><h2>Projects</h2></div>
        <div className="subhead"><h3>Contra Launch Video Music</h3><p>I composed and worked on the music for a series of Contra launch films.</p></div>
        <div className="project-list">{projects.map(p => <ProjectRow key={p.n} item={p} />)}</div>
      </section>

      <section id="contact" className="reveal contact">
        <div className="section-head"><p className="section-label mono">05 / Get in touch</p><h2>Contact</h2></div>
        <div className="socials">
          <a href="https://x.com/contraben" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong>X <Arrow /></strong><span>x.com/contraben</span></a>
          <a href="https://www.linkedin.com/in/ben-huffman-b7b6a8102/" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong>LinkedIn <Arrow /></strong><span>linkedin.com/in/ben-huffman-b7b6a8102</span></a>
          <a href="https://contra.com/ben" target="_blank" rel="noreferrer" data-space-effect="orbit"><strong>Contra <Arrow /></strong><span>contra.com/ben</span></a>
        </div>
      </section>
    </main>
    <footer><strong>Ben Huffman</strong><span className="mono">© 2026</span><a href="#about">Back to top ↑</a></footer>
  </>;
}
