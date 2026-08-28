import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const USER_AGENT = "get-ben.com daily-history research (https://get-ben.com)";
const ENWIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
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
    category: "People from New York City",
    categoryDepth: 2,
    maxPages: 8000,
    direct: /\b(new york(?: city)?|nyc|manhattan|brooklyn|queens|the bronx|staten island|harlem|wall street|times square|central park|broadway)\b/i,
    reject: /\b(upstate new york|new york state|buffalo|rochester|syracuse|albany)\b/i,
  },
  SF: {
    category: "People from San Francisco",
    categoryDepth: 2,
    maxPages: 4000,
    direct: /\b(san francisco|golden gate|alcatraz|presidio|yerba buena|treasure island|bay bridge)\b/i,
  },
  SPACE: {
    category: "Astronauts",
    categoryDepth: 2,
    maxPages: 5000,
    direct: /\b(space(?:craft|flight|walk| station| shuttle| probe| telescope| exploration)?|nasa|cosmonaut|astronaut|satellite|rocket|orbit(?:al|ed|ing)?|moon|lunar|planet|venus|mars|mercury|jupiter|saturn|uranus|neptune|pluto|asteroid|comet|galaxy|galileo|apollo|soyuz|sputnik|voyager|hubble|astronom(?:er|y|ical)|observatory|supernova|eclipse|enceladus)\b/i,
    reject: /\b(operation uranus|aloha from hawaii|rutan voyager|voyager, piloted|satellite awards?|satellite television)\b/i,
  },
};

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
    "04-18": { year: 1906, text: "The great San Francisco earthquake struck.", href: "https://earthquake.usgs.gov/earthquakes/events/1906calif/18april/" },
    "05-27": { year: 1937, text: "The Golden Gate Bridge opened to pedestrians.", href: "https://www.goldengate.org/bridge/history-research/moments-events/bridge-opening/" },
    "06-26": { year: 1945, text: "The United Nations Charter was signed here.", href: "https://www.un.org/en/about-us/history-of-the-un/san-francisco-conference" },
    "08-02": { year: 1873, text: "San Francisco’s first cable car began service.", href: "https://www.sfmta.com/getting-around/muni/cable-cars" },
    "08-27": { year: 1849, text: "A Gold Rush voyager entered the Golden Gate.", href: "https://www.nps.gov/safr/learn/historyculture/this-day-in-maritime-history-august.htm" },
    "10-17": { year: 1989, text: "The Loma Prieta earthquake reshaped the Bay.", href: "https://earthquake.usgs.gov/earthquakes/events/1989lomaprieta/" },
    "11-20": { year: 1969, text: "The occupation of Alcatraz Island began.", href: "https://www.nps.gov/alca/learn/historyculture/we-hold-the-rock.htm" },
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

async function categoryMembers(root, maxDepth, maxPages) {
  const queue = [{ title: `Category:${root}`, depth: 0 }];
  const visited = new Set();
  const pages = new Map();
  while (queue.length && pages.size < maxPages) {
    const current = queue.shift();
    if (visited.has(current.title)) continue;
    visited.add(current.title);
    let continuation = "";
    do {
      const url = apiUrl(ENWIKI_API, { action: "query", format: "json", formatversion: 2, list: "categorymembers", cmtitle: current.title, cmlimit: "max", cmtype: "page|subcat", ...(continuation ? { cmcontinue: continuation } : {}) });
      const data = await cachedJson(`category-${current.title}-${continuation || "start"}`, url);
      for (const member of data.query?.categorymembers ?? []) {
        if (member.ns === 0) pages.set(member.pageid, member.title);
        if (member.ns === 14 && current.depth < maxDepth) queue.push({ title: member.title, depth: current.depth + 1 });
      }
      continuation = data.continue?.cmcontinue ?? "";
    } while (continuation && pages.size < maxPages);
    process.stderr.write(`\r${root}: ${visited.size} categories, ${pages.size} pages`);
  }
  process.stderr.write("\n");
  return [...pages.entries()].slice(0, maxPages).map(([pageid, title]) => ({ pageid, title }));
}

async function peopleFromCategory(context, config) {
  const pages = await categoryMembers(config.category, config.categoryDepth, config.maxPages);
  const pageMeta = new Map();
  for (let index = 0; index < pages.length; index += 50) {
    const batch = pages.slice(index, index + 50);
    const url = apiUrl(ENWIKI_API, { action: "query", format: "json", formatversion: 2, prop: "pageprops|pageviews", ppprop: "wikibase_item", pvipdays: 60, pageids: batch.map((page) => page.pageid).join("|") });
    const data = await cachedJson(`${context}-pages-${index}`, url);
    for (const page of data.query?.pages ?? []) {
      const id = page.pageprops?.wikibase_item;
      if (!id) continue;
      const views = Object.values(page.pageviews ?? {}).reduce((sum, value) => sum + (value || 0), 0);
      pageMeta.set(id, { title: page.title, views });
    }
    process.stderr.write(`\r${context} page metadata: ${Math.min(index + 50, pages.length)}/${pages.length}`);
  }
  process.stderr.write("\n");

  const people = [];
  const ids = [...pageMeta.keys()];
  for (let index = 0; index < ids.length; index += 50) {
    const batch = ids.slice(index, index + 50);
    const url = apiUrl(WIKIDATA_API, { action: "wbgetentities", format: "json", formatversion: 2, ids: batch.join("|"), props: "claims|descriptions", languages: "en" });
    const data = await cachedJson(`${context}-entities-${index}`, url);
    for (const entity of Object.values(data.entities ?? {})) {
      const meta = pageMeta.get(entity.id);
      if (!meta) continue;
      for (const [property, kind] of [["P569", "born"], ["P570", "died"]]) {
        const time = entity.claims?.[property]?.[0]?.mainsnak?.datavalue?.value;
        if (!time?.time || time.precision < 11) continue;
        const match = /^\+?(\d+)-(\d{2})-(\d{2})T/.exec(time.time);
        if (!match) continue;
        people.push({
          context,
          kind,
          date: `${match[2]}-${match[3]}`,
          year: Number(match[1]),
          title: meta.title,
          description: entity.descriptions?.en?.value ?? "",
          views: meta.views,
          href: `https://en.wikipedia.org/wiki/${encodeURIComponent(meta.title.replaceAll(" ", "_"))}`,
        });
      }
    }
    process.stderr.write(`\r${context} historical figures: ${Math.min(index + 50, ids.length)}/${ids.length}`);
  }
  process.stderr.write("\n");
  return people;
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
  const result = new Map();
  for (const date of DATES) {
    const data = daily[date] ?? {};
    const entries = [
      ...(data.selected ?? []).map((entry) => ({ ...entry, selected: true })),
      ...(data.events ?? []).map((entry) => ({ ...entry, selected: false })),
    ];
    const candidates = entries.filter((entry) => pattern.test(entry.text ?? "") && !(reject?.test(entry.text ?? ""))).map((entry) => {
      const significance = /\b(first|discover|launch|land|open|found|inaugurat|debut|dedicat|completed|signed|began|established|introduced)\w*/i.test(entry.text ?? "") ? 90 : 0;
      const grim = /\b(kill|murder|assassinat|crash|explod|massacre|attack|disaster)\w*/i.test(entry.text ?? "") ? 260 : 0;
      return {
        year: Number(entry.year),
        text: cleanText(entry.text ?? ""),
        href: factHref(entry),
        score: (entry.selected ? 1000 : 500) + significance - grim,
        sourceType: "event",
      };
    }).filter((entry) => Number.isFinite(entry.year) && entry.text);
    candidates.sort((a, b) => b.score - a.score || a.year - b.year);
    if (candidates[0]) result.set(date, candidates[0]);
  }
  return result;
}

const UNSUITABLE = /\b(murder|killer|child molester|rapist|terrorist|pornographic|criminal|mass shooter|nazi|missing child|victim|gangster|mobster)\b/i;
const PREFERRED = /\b(artist|architect|designer|scientist|astronomer|astronaut|engineer|inventor|writer|author|musician|composer|director|actor|photographer|entrepreneur|founder|activist|athlete|journalist|educator|physician)\b/i;

function personFact(person) {
  let description = person.description.replaceAll(/\s*\([^)]*\)\s*/g, " ").replaceAll(/\s+/g, " ").trim();
  if (description.length > 52) description = description.split(/,|;| who /i)[0];
  const action = person.kind === "born" ? "was born" : "died";
  let text = description ? `${person.title}, ${description}, ${action}.` : `${person.title} ${action}.`;
  text = cleanText(text);
  return {
    year: person.year,
    text,
    href: person.href,
    sourceType: person.kind,
    score: Math.log10(person.views + 1) * 100 + (PREFERRED.test(person.description) ? 70 : 0) + (person.kind === "born" ? 10 : 0),
  };
}

function assemble(context, events, people) {
  const result = {};
  const peopleByDate = new Map();
  for (const person of people) {
    if (UNSUITABLE.test(person.description)) continue;
    const fact = personFact(person);
    const current = peopleByDate.get(person.date);
    if (!current || fact.score > current.score) peopleByDate.set(person.date, fact);
  }
  for (const date of DATES) {
    const event = events.get(date), person = peopleByDate.get(date);
    const generated = !event ? person : !person ? event : event.score >= person.score ? event : person;
    const fact = OVERRIDES[context]?.[date] ?? generated;
    if (fact) result[date] = { year: fact.year, text: fact.text, href: fact.href, sourceType: OVERRIDES[context]?.[date] ? "curated" : fact.sourceType };
  }
  return result;
}

await mkdir(CACHE_DIR, { recursive: true });
const daily = await loadOnThisDay();
const output = {};
for (const context of ["NY", "SF", "SPACE"]) {
  const people = await peopleFromCategory(context, CONFIG[context]);
  const events = eventCandidates(context, daily);
  output[context] = assemble(context, events, people);
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
