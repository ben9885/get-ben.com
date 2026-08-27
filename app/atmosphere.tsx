"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

export type City = "SF" | "NY";
export type WeatherState = { weatherCode: number; temperature: number; cloudCover: number; humidity: number; precipitation: number; visibility: number } | null;
type Oklch = [number, number, number];
export type Atmosphere = { id: string; style: CSSProperties; foreground: string; line: string; nav: string };

export const CITIES = {
  SF: { name: "San Francisco", lat: 37.7749, lng: -122.4194, zone: "America/Los_Angeles", bias: [82, .055, 220] as Oklch },
  NY: { name: "New York", lat: 40.7128, lng: -74.006, zone: "America/New_York", bias: [66, .14, 263] as Oklch },
} as const;

const palettes: Record<string, Oklch[]> = {
  night: [[17,.055,258],[25,.09,260],[31,.09,278],[80,.04,250],[41,.12,270],[35,.11,292],[39,.05,255]],
  predawn: [[25,.1,263],[37,.13,274],[55,.1,305],[87,.08,67],[60,.13,324],[49,.15,291],[65,.08,285]],
  sunrise: [[38,.15,265],[55,.17,293],[75,.13,34],[94,.09,82],[78,.16,43],[58,.17,318],[82,.08,53]],
  morning: [[55,.17,250],[68,.15,236],[85,.08,215],[97,.05,90],[87,.1,204],[68,.12,278],[90,.04,220]],
  midday: [[51,.21,253],[67,.17,236],[84,.1,218],[98,.04,92],[88,.1,205],[66,.15,275],[89,.05,223]],
  golden: [[51,.18,256],[62,.15,278],[77,.13,61],[95,.09,86],[79,.17,53],[57,.17,292],[84,.1,55]],
  sunset: [[40,.19,266],[53,.19,300],[72,.17,36],[91,.11,72],[76,.2,41],[49,.19,292],[78,.12,21]],
  twilight: [[29,.15,265],[39,.17,278],[51,.13,313],[78,.08,36],[61,.14,325],[43,.17,292],[57,.1,310]],
};

const clamp = (v:number, min=0, max=1) => Math.max(min, Math.min(max, v));
const lerp = (a:number,b:number,t:number) => a + (b-a)*t;
function color(a:Oklch,b:Oklch,t:number):Oklch { let dh=((b[2]-a[2]+540)%360)-180; return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),(a[2]+dh*t+360)%360]; }
function css(c:Oklch, alpha=1) { return `oklch(${c[0].toFixed(2)}% ${Math.max(0,c[1]).toFixed(4)} ${c[2].toFixed(2)} / ${alpha})`; }
function tune(c:Oklch, light=0, chroma=1, hue=0):Oklch { return [clamp(c[0]+light,8,98),Math.max(0,c[1]*chroma),(c[2]+hue+360)%360]; }

function zonedParts(date:Date, zone:string) {
  const p=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:zone,year:"numeric",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(date).filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
  return { year:p.year, month:p.month, day:p.day, hour:p.hour, minute:p.minute, second:p.second };
}
function dayOfYear(y:number,m:number,d:number) { return Math.floor((Date.UTC(y,m-1,d)-Date.UTC(y,0,0))/86400000); }
function timezoneOffsetHours(date:Date,zone:string) { const p=zonedParts(date,zone); return (Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-date.getTime())/3600000; }
function solarState(date:Date, city:City) {
  const c=CITIES[city], p=zonedParts(date,c.zone), doy=dayOfYear(p.year,p.month,p.day), hour=p.hour+p.minute/60+p.second/3600;
  const gamma=2*Math.PI/365*(doy-1+(hour-12)/24);
  const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
  const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
  const offset=timezoneOffsetHours(date,c.zone), solarMinutes=hour*60+eq+4*c.lng-60*offset, ha=(solarMinutes/4-180)*Math.PI/180, lat=c.lat*Math.PI/180;
  const altitude=Math.asin(Math.sin(lat)*Math.sin(decl)+Math.cos(lat)*Math.cos(decl)*Math.cos(ha));
  const azimuth=Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(lat)-Math.tan(decl)*Math.cos(lat))*180/Math.PI+180;
  const cosH=(Math.cos(90.833*Math.PI/180)/(Math.cos(lat)*Math.cos(decl))-Math.tan(lat)*Math.tan(decl));
  const h=Math.acos(clamp(cosH,-1,1))*180/Math.PI, noon=(720-4*c.lng-eq)/60+offset;
  return { hour, altitude:altitude*180/Math.PI, azimuth, sunrise:noon-h/15, sunset:noon+h/15 };
}
function paletteAt(s:{hour:number;sunrise:number;sunset:number}) {
  const anchors=[
    {t:0,p:"night"},{t:Math.max(0,s.sunrise-.85),p:"predawn"},{t:s.sunrise,p:"sunrise"},{t:s.sunrise+1.5,p:"morning"},
    {t:(s.sunrise+s.sunset)/2,p:"midday"},{t:s.sunset-1.3,p:"golden"},{t:s.sunset,p:"sunset"},{t:s.sunset+.75,p:"twilight"},{t:24,p:"night"},
  ].sort((a,b)=>a.t-b.t);
  let i=anchors.findIndex(a=>a.t>=s.hour); if(i<1)i=1; const a=anchors[i-1],b=anchors[i],t=clamp((s.hour-a.t)/(b.t-a.t));
  return palettes[a.p].map((v,n)=>color(v,palettes[b.p][n],t));
}
export function weatherLabel(code:number) { if(code===0)return "Clear"; if(code<=2)return "Partly cloudy"; if(code===3)return "Overcast"; if([45,48].includes(code))return "Fog"; if(code>=71&&code<=77)return "Snow"; if(code>=95)return "Storm"; if((code>=51&&code<=67)||(code>=80&&code<=82))return "Rain"; return "Cloudy"; }

function generateAtmosphere(city:City, weather:WeatherState, date=new Date()):Atmosphere {
  date = new Date(date); date.setSeconds(0,0);
  const solar=solarState(date,city), base=paletteAt(solar), clouds=(weather?.cloudCover??35)/100, humidity=(weather?.humidity??55)/100;
  const condition=weather?weatherLabel(weather.weatherCode):"Time-based", fog=condition==="Fog", rain=condition==="Rain"||condition==="Storm", clear=condition==="Clear";
  const cityBias=CITIES[city].bias, cityAmount=city==="SF"?.13:.1;
  let p=base.map(c=>color(c,cityBias,cityAmount));
  const chroma=(clear?1.08:1)*(1-clouds*.18)*(fog?.58:1)*(rain?.78:1), light=(fog?8:0)+(rain?-5:0)+(condition==="Snow"?12:0);
  p=p.map((c,i)=>tune(c,light*(i<3?1:.5),chroma,city==="SF"?-2:1));
  const daylight=clamp((solar.altitude+7)/18), sunX=clamp(8+(solar.azimuth/360)*84,5,95), sunY=clamp(93-solar.altitude*1.25,8,96);
  const sunIntensity=daylight*(1-clouds*.58)*(fog?.3:1)*(rain?.35:1), sunSize=lerp(56,105,clouds)*(fog?1.3:1), haze=clamp(.12+humidity*.18+clouds*.12+(fog?.32:0)+(Math.abs(solar.altitude)<10?.18:0));
  const ambientX=city==="SF"?76:22, ambientY=solar.azimuth<180?70:26, night=solar.altitude < -7;
  const foreground=(p[0][0]+p[1][0]+p[2][0])/3<52?"#f3f1e8":"#252a3c", line=(foreground==="#f3f1e8"?"rgba(243,241,232,.32)":"rgba(37,42,60,.3)");
  const style={
    "--sky-top":css(p[0]),"--sky-mid":css(p[1]),"--sky-horizon":css(p[2]),"--sun-core":css(p[3],sunIntensity*.8),"--sun-glow":css(p[4],sunIntensity*.42),
    "--sun-x":`${sunX}%`,"--sun-y":`${sunY}%`,"--sun-size":`${sunSize}vw`,"--ambient-color":css(p[5],night?.38:.48),"--ambient-x":`${ambientX}%`,"--ambient-y":`${ambientY}%`,
    "--haze-color":css(p[6],haze),"--haze-opacity":haze,"--foreground":foreground,"--atmosphere-line":line,
  } as CSSProperties;
  return {id:`${city}-${date.getMinutes()}-${weather?.weatherCode??"t"}-${weather?.cloudCover??0}`,style,foreground,line,nav:css(p[0],.9)};
}

function readCache():Partial<Record<City,{at:number;data:WeatherState}>> { try{return JSON.parse(localStorage.getItem("weather-cache")||"{}")}catch{return{}} }
async function fetchBothWeather() {
  const cache=readCache(), fresh=Date.now()-15*60*1000; if(cache.SF?.at&&cache.NY?.at&&cache.SF.at>fresh&&cache.NY.at>fresh)return cache;
  const keys=(Object.keys(CITIES) as City[]); const results=await Promise.all(keys.map(async city=>{const c=CITIES[city];try{const u=`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,weather_code,cloud_cover,relative_humidity_2m,precipitation,visibility&temperature_unit=fahrenheit&timezone=${encodeURIComponent(c.zone)}`;const r=await fetch(u);if(!r.ok)throw 0;const j=await r.json(),x=j.current;return [city,{at:Date.now(),data:{weatherCode:x.weather_code,temperature:x.temperature_2m,cloudCover:x.cloud_cover,humidity:x.relative_humidity_2m,precipitation:x.precipitation,visibility:x.visibility}}] as const}catch{return [city,cache[city]||{at:Date.now(),data:null}] as const}}));
  const next=Object.fromEntries(results); localStorage.setItem("weather-cache",JSON.stringify(next)); return next;
}

export function useCityAtmosphere() {
  const [city,setCityState]=useState<City>("NY"),[weather,setWeather]=useState<Partial<Record<City,WeatherState>>>({}),[tick,setTick]=useState(0);
  useEffect(()=>{const saved=localStorage.getItem("preferredCity")||localStorage.getItem("ben-city");if(saved==="SF"||saved==="NY")setCityState(saved); const hydrate=()=>fetchBothWeather().then(x=>setWeather({SF:x.SF?.data??null,NY:x.NY?.data??null}));hydrate();const w=setInterval(hydrate,15*60*1000),t=setInterval(()=>setTick(v=>v+1),60000);return()=>{clearInterval(w);clearInterval(t)}},[]);
  const setCity=(next:City)=>{setCityState(next);localStorage.setItem("preferredCity",next)};
  const atmosphere=useMemo(()=>generateAtmosphere(city,weather[city]??null),[city,weather,tick]);
  useEffect(()=>{const r=document.documentElement;r.style.setProperty("--ink",atmosphere.foreground);r.style.setProperty("--line",atmosphere.line);r.style.setProperty("--nav-bg",atmosphere.nav)},[atmosphere]);
  return {city,setCity,weather:weather[city]??null,atmosphere};
}

function Layer({a,className}:{a:Atmosphere;className:string}) { return <div className={`atmosphere-layer ${className}`} style={a.style} aria-hidden /> }
export function AtmosphereBackground({atmosphere}:{atmosphere:Atmosphere}) {
  const [current,setCurrent]=useState(atmosphere),[outgoing,setOutgoing]=useState<Atmosphere|null>(null);
  useEffect(()=>{if(atmosphere.id===current.id)return;setOutgoing(current);setCurrent(atmosphere);const t=setTimeout(()=>setOutgoing(null),1500);return()=>clearTimeout(t)},[atmosphere,current]);
  return <div className="atmosphere-background" aria-hidden>{outgoing&&<Layer a={outgoing} className="is-outgoing"/>}<Layer a={current} className="is-current"/><div className="grain"/></div>;
}

export function CitySwitcher({city,setCity,weather}:{city:City;setCity:(c:City)=>void;weather:WeatherState}) {
  const c=CITIES[city],time=new Intl.DateTimeFormat("en-US",{timeZone:c.zone,hour:"numeric",minute:"2-digit"}).format(new Date());
  return <div className="environment"><div className="city-switch" aria-label="Site atmosphere location"><button onClick={()=>setCity("SF")} className={city==="SF"?"selected":""} aria-pressed={city==="SF"}><img className="city-glyph" src="/city-icons/sf.png" alt="" />SF</button><button onClick={()=>setCity("NY")} className={city==="NY"?"selected":""} aria-pressed={city==="NY"}><img className="city-glyph" src="/city-icons/ny.png" alt="" />NY</button></div><div className="weather-tip" role="status"><strong>{c.name}</strong><span>{weather?`${Math.round(weather.temperature)}° · ${weatherLabel(weather.weatherCode)}`:"Local solar atmosphere"}</span><span>{time}</span></div></div>;
}
