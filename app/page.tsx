"use client";

import { useEffect, useState } from "react";
import { AtmosphereBackground, CitySwitcher, useCityAtmosphere } from "./atmosphere";

const sections = ["about", "contra", "projects", "investments", "research", "opinions"];

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
  { n: "01", title: "TASTE: A Designer-Annotated Multi-Dimensional Preference Dataset for AI-Generated Graphic Design", meta: "2026 · Paper", href: "https://arxiv.org/abs/2605.20731" },
  { n: "02", title: "The Human Creativity Benchmark", meta: "2026 · Paper", href: "https://arxiv.org/abs/2606.30561" },
  { n: "03", title: "Contra Labs Research", meta: "Ongoing · Research", href: "https://contra.com/labs" },
];

function Arrow() { return <span className="arrow" aria-hidden>↗</span>; }

function ContraLogo({ labs = false }: { labs?: boolean }) {
  if (labs) return <img className="brand-logo labs-logo" src="/contra-labs.svg" alt="Contra Labs" />;
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
    <button className="project-row" onClick={() => setOpen(!open)} aria-expanded={open}>
      <span className="mono">{item.n}</span><span className="project-title">{item.title}</span><span className="mono date">{item.date}</span><span className="toggle">{open ? "−" : "+"}</span>
    </button>
    <div className="video-shell">{open && <div className="video"><iframe src={src} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={item.title} loading="lazy" /></div>}</div>
  </div>;
}

export default function Home() {
  const [active, setActive] = useState("about");
  const { city, setCity, weather, atmosphere } = useCityAtmosphere();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: "-20% 0px -65%" });
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return <>
    <AtmosphereBackground atmosphere={atmosphere} />
    <Navigation active={active} citySwitcher={<CitySwitcher city={city} setCity={setCity} weather={weather} />} />
    <main>
      <section id="about" className="hero reveal">
        <p className="eyebrow mono">Ben Huffman · Internet homepage</p>
        <h1>Hey, I’m Ben<span className="serif">.</span></h1>
        <p className="dek">I’m a creative generalist, builder, entrepreneur, and angel investor.</p>
        <div className="hero-notes mono"><span>Founder × creative director</span><span>Researcher × musician</span></div>
      </section>

      <section id="contra" className="statement reveal">
        <p className="section-label mono">01 / Currently</p>
        <p className="large-copy">I am building <a className="brand-inline" href="https://contra.com/" target="_blank" rel="noreferrer"><ContraLogo /><Arrow /></a> and <a className="brand-inline" href="https://contra.com/labs" target="_blank" rel="noreferrer"><ContraLogo labs /><Arrow /></a> to help creativity meet opportunity globally. Contra supports millions of users earning hundreds of millions of dollars annually in over 180 countries.</p>
        <div className="link-pair">
          <a href="https://contra.com/" target="_blank" rel="noreferrer"><strong><ContraLogo /><Arrow /></strong><span>Independent work infrastructure</span></a>
          <a href="https://contra.com/labs" target="_blank" rel="noreferrer"><strong><ContraLogo labs /><Arrow /></strong><span>Human data + RL infrastructure for creative AI</span></a>
        </div>
      </section>

      <section id="projects" className="reveal">
        <div className="section-head"><p className="section-label mono">02 / Selected work</p><h2>Projects</h2></div>
        <div className="subhead"><h3>Contra Launch Video Music</h3><p>I composed and worked on the music for a series of Contra launch films.</p></div>
        <div className="project-list">{projects.map(p => <ProjectRow key={p.n} item={p} />)}</div>
      </section>

      <section id="investments" className="reveal">
        <div className="section-head"><p className="section-label mono">03 / Angel portfolio</p><h2>Investments</h2></div>
        <div className="index investments"><div className="index-head mono"><span>Company</span><span>Stage</span><span>Year</span></div>{investments.map(([name, href, stage, year]) => <div className="index-row" key={name}><span>{href ? <ExternalLink href={href}>{name}</ExternalLink> : name}</span><span>{stage}</span><span className="mono">{year}</span></div>)}</div>
      </section>

      <section id="research" className="reveal">
        <div className="section-head"><p className="section-label mono">04 / Publications</p><h2>Research</h2></div>
        <div className="research-list">{research.map(r => <a href={r.href} target="_blank" rel="noreferrer" key={r.n} className="research-row"><span className="mono">{r.n}</span><strong>{r.title}</strong><span className="research-meta mono">{r.meta} <Arrow /></span></a>)}</div>
      </section>

      <section id="opinions" className="reveal opinions">
        <div className="section-head"><p className="section-label mono">05 / Elsewhere</p><h2>Opinions</h2></div>
        <div className="socials"><a href="https://x.com/contraben" target="_blank" rel="noreferrer"><strong>X <Arrow /></strong><span>@contraben</span></a><a href="https://www.linkedin.com/in/benhuffman" target="_blank" rel="noreferrer"><strong>LinkedIn <Arrow /></strong><span>Ben Huffman</span></a><a href="https://contra.com/ben" target="_blank" rel="noreferrer"><strong>Contra <Arrow /></strong><span>contra.com/ben</span></a></div>
      </section>
    </main>
    <footer><strong>Ben Huffman</strong><span className="mono">© 2026</span><a href="#about">Back to top ↑</a></footer>
  </>;
}
