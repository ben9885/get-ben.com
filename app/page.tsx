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
        <p className="large-copy">I am building <ExternalLink href="https://contra.com">Contra</ExternalLink> and <ExternalLink href="https://contra.com/labs">Contra Labs</ExternalLink> to help creativity meet opportunity globally, supporting millions of users earning hundreds of millions of dollars annually in over 180 countries.</p>
        <div className="link-pair">
          <a href="https://contra.com" target="_blank" rel="noreferrer"><strong>Contra <Arrow /></strong><span>Independent work infrastructure</span></a>
          <a href="https://contra.com/labs" target="_blank" rel="noreferrer"><strong>Contra Labs <Arrow /></strong><span>Human data + RL infrastructure for creative AI</span></a>
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
