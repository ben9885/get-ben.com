import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const USER_AGENT = "get-ben.com daily-history research (https://get-ben.com)";
const CACHE_DIR = "/private/tmp/get-ben-daily-facts-cache";
const OUTPUT = new URL("../app/data/daily-facts.json", import.meta.url);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DATES = [];
for (let month = 1; month <= 12; month += 1) {
  const days = new Date(Date.UTC(2024, month, 0)).getUTCDate();
  for (let day = 1; day <= days; day += 1) DATES.push(`${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
}

const CONFIG = {
  NY: {
    direct: /\b(new york(?: city)?|nyc|manhattan|brooklyn|queens|the bronx|staten island|harlem|wall street|times square|central park|broadway)\b/i,
    reject: /\b(upstate new york|new york state|buffalo|rochester|syracuse|albany)\b/i,
  },
  SF: {
    direct: /\b(san francisco|golden gate|alcatraz|presidio|yerba buena|treasure island|bay bridge)\b/i,
  },
  SPACE: {
    direct: /\b(space(?:craft|flight|walk| station| shuttle| probe| telescope| exploration)?|nasa|cosmonaut|astronaut|satellite|rocket|orbit(?:al|ed|ing)?|moon|lunar|planet|venus|mars|mercury|jupiter|saturn|uranus|neptune|pluto|asteroid|comet|galaxy|galileo|apollo|soyuz|sputnik|voyager|hubble|astronom(?:er|y|ical)|observatory|supernova|eclipse|enceladus)\b/i,
    reject: /\b(operation uranus|aloha from hawaii|rutan voyager|voyager, piloted|satellite awards?|satellite television)\b/i,
  },
};

const CONTENT_EXCLUSIONS = /\b(civil rights|human rights|voting rights|women'?s rights|gay rights|lgbt\w*|queer\w*|stonewall|suffrag\w*|abolition\w*|slave|slavery|segregat\w*|desegregat\w*|racial discrimination|emancipat\w*|internment|birthday)\b/i;
const ARCHITECTURE = /\b(architect|architecture|building|tower|skyscraper|bridge|tunnel|station|terminal|hall|museum|library|theatre|theater|hotel|church|cathedral|temple|park|plaza|square|monument|landmark|district|house|housing|palace|stadium|arena|airport|pier|ferry|fort|presidio)\b/i;
const GOVERNMENT = /\b(government|mayor|council|court|legislature|authority|department|commission|charter|municipal|public agency|treaty|election|law|administration)\b/i;
const INFRASTRUCTURE = /\b(subway|rail|railway|transit|road|highway|water|power|utility|port|harbor|airport|bridge|tunnel|station|terminal|ferry|cable car)\b/i;
const POLITICAL_HISTORY = /\b(president|prime minister|parliament|congress|senate|constitution|constitutional|treaty|election|elected|government|republic|kingdom|empire|independence|declaration|diplomatic|legislature|court|law|administration|mayor|governor)\b/i;
const DEATH_REFERENCES = /\b(dies?|died|death|dead|killed|fatal|execution|executed|assassinat\w*|murder\w*|massacre|casualties)\b/i;

const OVERRIDES = {
  NY: {
    "01-01": { year: 1898, text: "The five boroughs became one New York City.", href: "https://www.nyc.gov/site/records/historical-records/collections.page" },
    "02-02": { year: 1913, text: "Grand Central Terminal opened its doors.", href: "https://www.grandcentralterminal.com/history/" },
    "05-24": { year: 1883, text: "The Brooklyn Bridge opened to the public.", href: "https://www.nps.gov/places/brooklyn-bridge.htm" },
    "08-27": { year: 1776, text: "The Battle of Brooklyn was fought.", href: "https://www.nps.gov/gois/learn/historyculture/battle-of-brooklyn.htm" },
    "10-27": { year: 1904, text: "New York’s first subway line opened.", href: "https://new.mta.info/agency/new-york-city-transit/subway-bus-ridership-1900-2018" },
    "10-28": { year: 1886, text: "The Statue of Liberty was dedicated.", href: "https://www.nps.gov/stli/learn/historyculture/places_creating_statue.htm" },
    "11-13": { year: 1927, text: "The Holland Tunnel opened to traffic.", href: "https://www.panynj.gov/bridges-tunnels/en/holland-tunnel/history.html" },
    "12-31": { year: 1904, text: "Times Square held its first New Year celebration.", href: "https://www.timessquarenyc.org/times-square-new-years-eve/nye-history-times-square" },
  },
  SF: {
    "01-30": { year: 1847, text: "Yerba Buena was renamed San Francisco.", href: "https://www.sfhistory.org/" },
    "03-13": { year: 1865, text: "The steamships Golden City and America departed with record passenger traffic.", href: "https://legacy.sfgenealogy.org/sf/history/he865.htm" },
    "03-31": { year: 1850, text: "A federal commission recommended reserving the Presidio for military use.", href: "https://legacy.sfgenealogy.org/sf/history/hbbega.htm" },
    "04-08": { year: 1862, text: "The Russ House hotel opened to guests.", href: "https://legacy.sfgenealogy.org/sf/history/he862.htm" },
    "04-18": { year: 1906, text: "The great San Francisco earthquake struck.", href: "https://earthquake.usgs.gov/earthquakes/events/1906calif/18april/" },
    "05-27": { year: 1937, text: "The Golden Gate Bridge opened to pedestrians.", href: "https://www.goldengate.org/bridge/history-research/moments-events/bridge-opening/" },
    "06-26": { year: 1945, text: "The United Nations Charter was signed here.", href: "https://www.un.org/en/about-us/history-of-the-un/san-francisco-conference" },
    "06-29": { year: 1776, text: "Mission Dolores was founded at the edge of the growing settlement.", href: "https://www.sfmuseum.org/hist6/founding.html" },
    "07-26": { year: 1776, text: "Moraga moved his camp north and began building the early Presidio.", href: "https://www.sfmuseum.org/hist6/founding.html" },
    "08-02": { year: 1873, text: "San Francisco’s first cable car began service.", href: "https://www.sfmta.com/getting-around/muni/cable-cars" },
    "08-27": { year: 1849, text: "A Gold Rush voyager entered the Golden Gate.", href: "https://www.nps.gov/safr/learn/historyculture/this-day-in-maritime-history-august.htm" },
    "10-17": { year: 1989, text: "The Loma Prieta earthquake reshaped the Bay.", href: "https://earthquake.usgs.gov/earthquakes/events/1989lomaprieta/" },
    "10-08": { year: 1849, text: "A prefabricated Methodist church was dedicated on Powell Street.", href: "https://legacy.sfgenealogy.org/sf/history/hbbeg17.htm" },
    "10-13": { year: 1849, text: "California’s first state constitution was signed after the constitutional convention.", href: "https://legacy.sfgenealogy.org/sf/history/hbbegn11.htm" },
    "11-20": { year: 1969, text: "The occupation of Alcatraz Island began.", href: "https://www.nps.gov/alca/learn/historyculture/we-hold-the-rock.htm" },
    "11-06": { year: 2010, text: "The renovated Parkside Branch Library reopened.", href: "https://sfpl.org/sites/default/files/pdf/blip/parksidefaq.pdf" },
    "12-30": { year: 1911, text: "The Pantages Theatre opened on Market Street.", href: "https://sanfranciscotheatres.blogspot.com/2017/10/pantages-theatre.html" },
  },
  SPACE: {
    "01-31": { year: 1958, text: "Explorer 1 became America’s first satellite.", href: "https://science.nasa.gov/mission/explorer-1/" },
    "02-20": { year: 1962, text: "John Glenn orbited Earth aboard Friendship 7.", href: "https://www.nasa.gov/history/60-years-ago-john-glenn-the-first-american-to-orbit-the-earth-aboard-friendship-7/" },
    "02-25": { year: 2026, text: "Artemis II’s Moon rocket rolled back for troubleshooting.", href: "https://www.nasa.gov/blogs/missions/2026/02/25/nasa-artemis-ii-rocket-rolls-back-to-vehicle-assembly-building/" },
    "04-12": { year: 1961, text: "Yuri Gagarin became the first human in space.", href: "https://www.nasa.gov/history/60-years-ago-yuri-gagarin-becomes-the-first-man-in-space/" },
    "04-18": { year: 1969, text: "Armstrong and Aldrin rehearsed their lunar surface work.", href: "https://www.nasa.gov/history/50-years-ago-apollo-11-preparations-in-april-1969/" },
    "05-05": { year: 1961, text: "Alan Shepard became the first American in space.", href: "https://www.nasa.gov/history/60-years-ago-alan-shepard-becomes-the-first-american-in-space/" },
    "07-20": { year: 1969, text: "Apollo 11 landed humans on the Moon.", href: "https://www.nasa.gov/mission/apollo-11/" },
    "08-27": { year: 1962, text: "Mariner 2 launched toward Venus.", href: "https://science.nasa.gov/mission/mariner-2/" },
    "08-28": { year: 1789, text: "William Herschel discovered Saturn’s moon Enceladus.", href: "https://science.nasa.gov/saturn/moons/enceladus/" },
    "10-04": { year: 1957, text: "Sputnik 1 opened the space age.", href: "https://www.nasa.gov/history/sputnik/sputorig.html" },
    "12-10": { year: 1963, text: "The X-20 Dyna-Soar spaceplane project was canceled.", href: "https://www.nasa.gov/history/SP-4225/documentation/early-station/early.htm" },
    "12-16": { year: 1959, text: "NASA issued its first long-range exploration plan.", href: "https://www.nasa.gov/history/nasa-long-range-plan-1959/" },
    "12-17": { year: 1967, text: "Surveyor 5 ended after returning 19,000 lunar images.", href: "https://www.nasa.gov/history/50-years-ago-surveyors-pave-the-way-to-the-moon/" },
    "12-24": { year: 1968, text: "Apollo 8 witnessed the first Earthrise.", href: "https://www.nasa.gov/image-article/apollo-8-earthrise/" },
    "12-26": { year: 1973, text: "Soyuz 13 returned after an astronomical survey mission.", href: "https://www.nasa.gov/wp-content/uploads/static/history/SP-4408pt2.pdf" },
  },
};

async function cachedJson(key, url) {
  const path = join(CACHE_DIR, `${key.replaceAll(/[^a-zA-Z0-9_-]/g, "_")}.json`);
  try { return JSON.parse(await readFile(path, "utf8")); } catch {}
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
    if (response.ok) {
      const data = await response.json();
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, JSON.stringify(data));
      await sleep(140);
      return data;
    }
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 7) throw new Error(`${response.status}: ${url}`);
    const retryAfter = Number(response.headers.get("retry-after") || 0);
    await sleep(Math.min(30000, Math.max(retryAfter * 1000, 2500 * (attempt + 1))));
  }
}

function apiUrl(base, values) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(values)) url.searchParams.set(key, String(value));
  return url;
}

async function loadOnThisDay() {
  const result = {};
  for (let index = 0; index < DATES.length; index += 8) {
    const batch = await Promise.all(DATES.slice(index, index + 8).map(async (date) => {
      const [month, day] = date.split("-");
      return [date, await cachedJson(`otd-${date}`, `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`)];
    }));
    Object.assign(result, Object.fromEntries(batch));
    process.stderr.write(`\rDaily history: ${Math.min(index + 8, DATES.length)}/${DATES.length}`);
  }
  process.stderr.write("\n");
  return result;
}

function cleanText(text) {
  let value = text
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\s*\([^)]*\)/g, "")
    .replaceAll(/\s*\[[^\]]*\]/g, "")
    .replaceAll(/\bPOlish\b/g, "Polish")
    .replaceAll("United States", "U.S.")
    .replaceAll("New York City", "New York")
    .replaceAll(" of the American Football League", "")
    .replaceAll(" of the National Football League", "")
    .trim();
  if (value.includes(":")) {
    const [prefix, ...rest] = value.split(":");
    const detail = rest.join(":").trim();
    const hasVerb = (part) => /\b(?:is|are|was|were|becomes?|became|begins?|began|opens?|opened|launch(?:es|ed)?|lands?|landed|discover(?:s|ed)?|arrives?|arrived|makes?|made|sets?|signed|founds?|founded|starts?|started|ends?|ended|announces?|announced|performs?|performed|flies|flew|crosses?|crossed|returns?|returned|reaches?|reached|observes?|observed|publishes?|published|defeats?|defeated|wins?|won|receives?|received|takes?|took|conducts?|conducted|explodes?|exploded|strikes?|struck|touches?|touched|passes?|passed|presents?|presented|issues?|issued)\b/i.test(part);
    if (!hasVerb(prefix) && hasVerb(detail) && detail.length >= 28 && detail.length < value.length) value = detail;
    else value = `${prefix.trim()}: ${detail}`;
  }
  value = value.replace(/^(?:After|Following|During|Having|Fifty-nine days after)\b[^,]{10,72},\s*/i, "");
  const appositive = value.replace(/, [^,]{5,58}, /, " ");
  if (/\b(?:is|are|was|were|became|began|opened|launched|landed|discovered|arrived|made|set|signed|founded|started|ended|announced|performed|flew|crossed|returned|reached|observed|published|defeated|won|received|took|conducted|exploded|struck|touched|passed|presented|issued)\b/i.test(appositive)) value = appositive;
  value = value.split(/;|, (?:and|which|becoming|making|marking|leading|resulting|setting|where|with the|speaking|following|after|during|using|carrying|creating|prompting|causing|killing|injuring|allowing|ending|beginning|naming)|\b(?:due to|after|before|while|during|so that)\b/i)[0].trim();
  if (value.length > 96) {
    const comma = value.indexOf(",");
    const prefix = comma > 35 ? value.slice(0, comma) : "";
    if (prefix && /\b(?:is|are|was|were|became|began|opened|launched|landed|discovered|arrived|made|set|signed|founded|started|ended|announced|performed|flew|crossed|returned|reached|observed|published|defeated|won|received|took|conducted|exploded|struck|touched|passed|presented|issued)\b/i.test(prefix)) value = prefix;
  }
  value = value.replace(/[,:;]\s*$/, "");
  if (value && !/[.!?…]$/.test(value)) value += ".";
  if (value.length <= 96) return value;
  const sentence = value.slice(0, 92);
  return `${sentence.slice(0, sentence.lastIndexOf(" ")).replace(/[,:;.]$/, "")}…`;
}

function factHref(entry) {
  return entry.pages?.[0]?.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${MONTH_NAMES[0]}`;
}

function eventCandidates(context, daily) {
  const pattern = CONFIG[context].direct;
  const reject = CONFIG[context].reject;
  const local = new Map();
  const fallback = new Map();
  for (const date of DATES) {
    const data = daily[date] ?? {};
    const entries = [
      ...(data.selected ?? []).map((entry) => ({ ...entry, selected: true })),
      ...(data.events ?? []).map((entry) => ({ ...entry, selected: false })),
    ];
    const candidates = entries.filter((entry) => !CONTENT_EXCLUSIONS.test(entry.text ?? "") && !DEATH_REFERENCES.test(entry.text ?? "")).map((entry) => {
      const text = entry.text ?? "";
      const isLocal = pattern.test(text) && !(reject?.test(text));
      const isThemed = ARCHITECTURE.test(text) || GOVERNMENT.test(text) || INFRASTRUCTURE.test(text) || POLITICAL_HISTORY.test(text);
      const significance = /\b(first|discover|launch|land|open|found|inaugurat|debut|dedicat|completed|signed|began|established|introduced)\w*/i.test(entry.text ?? "") ? 90 : 0;
      const grim = /\b(kill|murder|assassinat|crash|explod|massacre|attack|disaster)\w*/i.test(entry.text ?? "") ? 260 : 0;
      return {
        year: Number(entry.year),
        text: cleanText(text),
        href: factHref(entry),
        score: (entry.selected ? 1000 : 500) + (isThemed ? 240 : 0) + significance - grim,
        sourceType: isLocal ? "event" : "global-event",
        isLocal,
      };
    }).filter((entry) => Number.isFinite(entry.year) && entry.text);
    candidates.sort((a, b) => b.score - a.score || a.year - b.year);
    const localCandidate = candidates.filter((entry) => entry.isLocal).sort((a, b) => b.score - a.score || a.year - b.year)[0];
    if (localCandidate) local.set(date, localCandidate);
    if (context !== "SPACE" && candidates[0]) fallback.set(date, candidates[0]);
  }
  return { local, fallback };
}

async function milestoneFacts(context, config) {
  const propertyCopy = context === "SPACE" ? {
    P619: ["launched", 260],
    P620: ["landed", 240],
  } : {
    P1619: ["opened", 260],
    P729: ["entered service", 230],
    P571: ["was established", 150],
    P580: ["began", 90],
    P576: ["closed", 30],
  };
  const placeValues = context === "NY"
    ? "wd:Q60 wd:Q11299 wd:Q18419 wd:Q18424 wd:Q18426 wd:Q271395"
    : "wd:Q62";
  const propertyValues = Object.keys(propertyCopy).map((property) => `wdt:${property}`).join(" ");
  const scope = context === "SPACE" ? "" : `VALUES ?place { ${placeValues} }\n  ?item wdt:P131 ?place.`;
  const query = `
SELECT DISTINCT ?item ?itemLabel ?date ?property ?article WHERE {
  VALUES ?property { ${propertyValues} }
  ?item ?property ?date.
  ${scope}
  ?article schema:about ?item;
           schema:isPartOf <https://en.wikipedia.org/>.
  ?item rdfs:label ?itemLabel.
  FILTER(LANG(?itemLabel) = "en")
}
LIMIT 12000`;
  const endpoint = apiUrl("https://query.wikidata.org/sparql", { query, format: "json" });
  const data = await cachedJson(`${context}-dated-milestones-sparql-v2`, endpoint);
  const byDate = new Map();
  for (const row of data.results?.bindings ?? []) {
    const property = row.property?.value?.split("/").pop();
    const copy = propertyCopy[property];
    const match = /^(-?\d+)-(\d{2})-(\d{2})T/.exec(row.date?.value ?? "");
    if (!copy || !match || Number(match[1]) <= 0) continue;
    const rawTitle = row.itemLabel?.value?.trim() ?? "";
    const qualifier = rawTitle.match(/\(([^)]+)\)/)?.[1] ?? "";
    let title = rawTitle.replaceAll(/\s*\([^)]*\)\s*/g, "").trim();
    if (/\b(IRT|BMT|IND|subway|railway|metro)\b/i.test(qualifier) && !/\bstation\b/i.test(title)) {
      title = `${title} station`;
    }
    if (!title || CONTENT_EXCLUSIONS.test(title)) continue;
    const searchable = title;
    const isArchitecture = context !== "SPACE" && ARCHITECTURE.test(searchable);
    const [verb, propertyScore] = copy;
    if (match[2] === "01" && match[3] === "01" && !["P1619", "P729", "P619", "P620"].includes(property)) continue;
    const fact = {
      year: Number(match[1]),
      text: cleanText(`${title} ${verb}.`),
      href: row.article?.value,
      sourceType: isArchitecture ? "architecture" : context === "SPACE" ? "space-milestone" : "civic-milestone",
      score: propertyScore + (isArchitecture ? 200 : 0) + (GOVERNMENT.test(searchable) ? 150 : 0) + (INFRASTRUCTURE.test(searchable) ? 130 : 0),
    };
    const date = `${match[2]}-${match[3]}`;
    const current = byDate.get(date);
    if (!current || fact.score > current.score) byDate.set(date, fact);
  }
  console.log(`${context} dated milestones: ${byDate.size} calendar dates`);
  return byDate;
}

function assemble(context, events, milestones) {
  const result = {};
  for (const date of DATES) {
    const localEvent = events.local.get(date), fallbackEvent = events.fallback.get(date), milestone = milestones.get(date);
    const generated = milestone?.sourceType === "architecture" ? milestone : localEvent ?? milestone ?? fallbackEvent;
    const fact = OVERRIDES[context]?.[date] ?? generated;
    if (fact) result[date] = { year: fact.year, text: fact.text, href: fact.href, sourceType: OVERRIDES[context]?.[date] ? "curated" : fact.sourceType };
  }
  return result;
}

await mkdir(CACHE_DIR, { recursive: true });
const daily = await loadOnThisDay();
const output = {};
for (const context of ["NY", "SF", "SPACE"]) {
  const events = eventCandidates(context, daily);
  const milestones = await milestoneFacts(context, CONFIG[context]);
  output[context] = assemble(context, events, milestones);
  const missing = DATES.filter((date) => !output[context][date]);
  const counts = Object.values(output[context]).reduce((acc, fact) => ({ ...acc, [fact.sourceType]: (acc[fact.sourceType] ?? 0) + 1 }), {});
  console.log(`${context}: ${Object.keys(output[context]).length}/${DATES.length}`, counts, missing.length ? `Missing: ${missing.join(", ")}` : "Complete");
}

const missing = Object.entries(output).flatMap(([context, facts]) => DATES.filter((date) => !facts[date]).map((date) => `${context}:${date}`));
if (missing.length) throw new Error(`Incomplete daily fact coverage: ${missing.join(", ")}`);

await mkdir(dirname(OUTPUT.pathname), { recursive: true });
const serialized = Object.fromEntries(Object.entries(output).map(([context, facts]) => [context, Object.fromEntries(Object.entries(facts).map(([date, { year, text, href }]) => [date, { year, text, href }]))]));
await writeFile(OUTPUT, `${JSON.stringify(serialized, null, 2)}\n`);
console.log(`Wrote ${Object.values(output).reduce((sum, facts) => sum + Object.keys(facts).length, 0)} facts to ${OUTPUT.pathname}`);
