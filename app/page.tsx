"use client";

import { useEffect, useState } from "react";

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

type CityKey = "SF" | "NY";
type WeatherState = { code: number; temperature: number } | null;
const cityData = {
  SF: { name: "San Francisco", latitude: 37.7749, longitude: -122.4194, zone: "America/Los_Angeles" },
  NY: { name: "New York", latitude: 40.7128, longitude: -74.006, zone: "America/New_York" },
} as const;

const palettes = [
  { hour: 0, colors: ["#10152f", "#1b2450", "#292743"] },
  { hour: 5, colors: ["#18234e", "#403768", "#694c6f"] },
  { hour: 7, colors: ["#c97783", "#efa06e", "#8a7fc5"] },
  { hour: 9, colors: ["#67b8df", "#9ed9e8", "#d9e5d6"] },
  { hour: 12, colors: ["#187ee8", "#4aa9ed", "#9cdbed"] },
  { hour: 16.5, colors: ["#267fc9", "#e2a15f", "#f0c38b"] },
  { hour: 18.5, colors: ["#d85c42", "#e38a58", "#73568f"] },
  { hour: 21, colors: ["#233e9c", "#3e3884", "#252b57"] },
  { hour: 24, colors: ["#10152f", "#1b2450", "#292743"] },
];

function hexToRgb(hex: string) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(rgb: number[]) { return `#${rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`; }
function mix(a: string, b: string, t: number) { const x = hexToRgb(a), y = hexToRgb(b); return rgbToHex(x.map((v, i) => v + (y[i] - v) * t)); }
function weatherLabel(code: number) {
  if (code === 0) return "Clear"; if (code <= 2) return "Partly cloudy"; if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog"; if (code >= 71 && code <= 77) return "Snow";
  if (code >= 95) return "Storm"; if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "Rain"; return "Cloudy";
}
function localHour(zone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  return Number(parts.find(p => p.type === "hour")?.value || 0) + Number(parts.find(p => p.type === "minute")?.value || 0) / 60;
}
function atmosphere(hour: number, weather: WeatherState) {
  const upperIndex = palettes.findIndex(p => p.hour >= hour); const upper = palettes[Math.max(1, upperIndex)]; const lower = palettes[Math.max(0, upperIndex - 1)];
  const t = (hour - lower.hour) / (upper.hour - lower.hour); let colors = lower.colors.map((c, i) => mix(c, upper.colors[i], t));
  const condition = weather ? weatherLabel(weather.code) : "Time-based";
  const modifier: Record<string, { target: string; amount: number }> = {
    Clear: { target: "#ffffff", amount: .06 }, "Partly cloudy": { target: "#a7b7c8", amount: .1 }, Overcast: { target: "#7d8da2", amount: .2 },
    Rain: { target: "#34475d", amount: .3 }, Fog: { target: "#d8dde1", amount: .28 }, Snow: { target: "#eef7ff", amount: .34 }, Storm: { target: "#202a3a", amount: .42 }, Cloudy: { target: "#8798aa", amount: .16 },
  };
  if (modifier[condition]) colors = colors.map(c => mix(c, modifier[condition].target, modifier[condition].amount));
  const avg = colors.map(hexToRgb).reduce((a, c) => a + c.reduce((s, v) => s + v, 0) / 3, 0) / colors.length;
  const lightText = avg < 116; const dot = condition === "Rain" || condition === "Storm" ? "#9cb5c9" : condition === "Fog" ? "#e9ebe8" : hour < 6 || hour > 20 ? "#a8c9ff" : hour > 16.5 ? "#ff9b56" : "#baff63";
  return { colors, ink: lightText ? "#f4f2e9" : "#30354a", line: lightText ? "rgba(244,242,233,.34)" : "rgba(48,53,74,.34)", nav: mix(colors[0], lightText ? "#090c17" : "#ffffff", lightText ? .08 : .04), dot, condition };
}

function Arrow() { return <span className="arrow" aria-hidden>↗</span>; }

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className={`external ${className}`}>{children} <Arrow /></a>;
}

function Navigation({ active, city, setCity, weather }: { active: string; city: CityKey; setCity: (city: CityKey) => void; weather: WeatherState }) {
  const info = cityData[city]; const time = new Intl.DateTimeFormat("en-US", { timeZone: info.zone, hour: "numeric", minute: "2-digit" }).format(new Date());
  return <header className="nav-wrap"><nav aria-label="Primary"><a href="#about" className="monogram" aria-label="Ben Huffman, home">BH</a><div className="nav-links">{sections.map(s => <a key={s} href={`#${s}`} className={active === s ? "active" : ""}>{s[0].toUpperCase() + s.slice(1)}</a>)}</div><div className="environment"><i aria-hidden /><div className="city-switch" aria-label="Site atmosphere location"><button onClick={() => setCity("SF")} className={city === "SF" ? "selected" : ""} aria-pressed={city === "SF"}>SF</button><span>/</span><button onClick={() => setCity("NY")} className={city === "NY" ? "selected" : ""} aria-pressed={city === "NY"}>NY</button></div><div className="weather-tip" role="status"><strong>{info.name}</strong><span>{weather ? `${Math.round(weather.temperature)}° · ${weatherLabel(weather.code)}` : "Live local atmosphere"}</span><span>{time}</span></div></div></nav></header>;
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
  const [city, setCityState] = useState<CityKey>("NY");
  const [weather, setWeather] = useState<WeatherState>(null);
  const setCity = (next: CityKey) => { setCityState(next); localStorage.setItem("ben-city", next); };
  useEffect(() => { const saved = localStorage.getItem("ben-city"); if (saved === "SF" || saved === "NY") setCityState(saved); }, []);
  useEffect(() => {
    let live = true; let currentWeather: WeatherState = null; const info = cityData[city];
    const apply = (current: WeatherState) => { const a = atmosphere(localHour(info.zone), current); const root = document.documentElement; root.style.setProperty("--sky", a.colors[0]); root.style.setProperty("--ambient", a.colors[1]); root.style.setProperty("--horizon", a.colors[2]); root.style.setProperty("--ink", a.ink); root.style.setProperty("--line", a.line); root.style.setProperty("--nav-bg", a.nav); root.style.setProperty("--dot", a.dot); };
    const fetchWeather = async () => { try { const url = `https://api.open-meteo.com/v1/forecast?latitude=${info.latitude}&longitude=${info.longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=${encodeURIComponent(info.zone)}`; const response = await fetch(url); if (!response.ok) throw new Error("weather unavailable"); const data = await response.json(); const next = { code: data.current.weather_code, temperature: data.current.temperature_2m }; if (live) { currentWeather = next; setWeather(next); apply(next); } } catch { if (live) { currentWeather = null; setWeather(null); apply(null); } } };
    setWeather(null); apply(null); fetchWeather(); const weatherTimer = window.setInterval(fetchWeather, 15 * 60 * 1000); const timeTimer = window.setInterval(() => apply(currentWeather), 60 * 1000);
    return () => { live = false; clearInterval(weatherTimer); clearInterval(timeTimer); };
  }, [city]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: "-20% 0px -65%" });
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return <>
    <Navigation active={active} city={city} setCity={setCity} weather={weather} />
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
        <div className="music-block">
          <p className="section-label mono">Music / Archive</p>
          <div className="music-copy"><div><h3>Music</h3><p>Benjamin Carlisle</p></div><p className="track">BBC Radio 1 – Pete Tong – Benjamin Carlisle – One <span className="serif">(Icarus Mix)</span></p></div>
          <iframe className="soundcloud" title="Benjamin Carlisle – One (Icarus Mix)" scrolling="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/234001774&color=%2334384c&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false" />
        </div>
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
