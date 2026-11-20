import type { World, Country, NewsItem } from './types';
import { VERSION, dateStr } from './types';
import { buildCountries, TECHS, CONSTRUCTION_KINDS } from './data';
import { EVENTS } from './events';
import { nextRandom, clamp, round2 } from './rng';

export function createWorld(playerId: string, seed = 1405): World {
  const w: World = {
    version: VERSION, year: 1946, month: 1, seed, rngState: seed,
    countries: buildCountries(), playerId, news: [], history: [],
    firedEvents: [], pendingEvent: null, over: false,
  };
  pushNews(w, 'جهان', 'آغاز عصر تازه', 'جنگ جهانی دوم پایان یافته و جهان در ۱ ژانویه ۱۹۴۶ میان دو ابرقدرت تقسیم می‌شود. آینده در دست شماست.', undefined, true);
  recordHistory(w);
  return w;
}

function rnd(w: World): number { const r = nextRandom(w.rngState); w.rngState = r.state; return r.value; }
export function pushNews(w: World, cat: string, title: string, body: string, country?: string, important = false) {
  const n: NewsItem = { id: `${dateStr(w)}-${w.news.length}-${Math.floor(rnd(w) * 1e6)}`, date: dateStr(w), cat, title, body, country, important };
  w.news = [n, ...w.news].slice(0, 200);
}
function recordHistory(w: World) {
  const p = w.countries[w.playerId]; if (!p) return;
  w.history = [...w.history, { date: dateStr(w), gdp: round2(p.gdp), pop: round2(p.population), treasury: round2(p.treasury) }].slice(-240);
}

export function techBonus(c: Country): number {
  let b = 1;
  for (const t of c.techs) { if (t === 'computing' || t === 'electronics') b += 0.05; if (t === 'micro' || t === 'microproc') b += 0.08; if (t === 'internet') b += 0.15; if (t === 'ai') b += 0.2; if (t === 'industry' || t === 'automation') b += 0.07; }
  return b;
}
export function militaryPower(c: Country): number {
  let p = c.military.army * 1 + c.military.navy * 0.7 + c.military.air * 0.9;
  p *= (0.5 + c.military.readiness / 200 + c.military.logistics / 250 + c.military.morale / 250);
  if (c.techs.includes('jet')) p *= 1.1; if (c.techs.includes('nuclear')) p *= 1.15; if (c.techs.includes('satellite')) p *= 1.05;
  return round2(p);
}

function tickCountry(w: World, c: Country) {
  const isPlayer = c.id === w.playerId;
  // --- اقتصاد: تولید، قیمت عرضه/تقاضا، بودجه ---
  let totalOutput = 0; let employed = 0;
  for (const s of c.sectors) {
    const demand = 0.75 + (c.policies.trade / 200) + (s.key === 'oil' ? 0.15 : 0);
    const supply = s.capacity > 0 ? s.output / s.capacity : 0;
    s.price = clamp(s.price * (1 + (demand - supply) * 0.04 + (rnd(w) - 0.5) * 0.01), 40, 260);
    const target = s.capacity * clamp(demand, 0.3, 1.05) * (0.7 + s.tech / 25) * (c.war ? 0.88 : 1);
    s.output = round2(s.output + (target - s.output) * 0.25);
    s.employed = round2(Math.min(c.population * 0.5, s.output * 0.12));
    totalOutput += s.output * (s.price / 100); employed += s.employed;
  }
  const workforce = c.population * 0.45;
  c.unemployment = round2(clamp(100 - (employed / Math.max(0.1, workforce)) * 100, 1, 55));
  const growth = clamp((totalOutput / Math.max(1, c.gdp) - 0.55) * 0.02 * techBonus(c) + (rnd(w) - 0.48) * 0.004 - (c.war ? 0.008 : 0), -0.03, 0.03);
  c.gdp = round2(Math.max(0.2, c.gdp * (1 + growth)));
  const taxRev = c.gdp * (c.policies.tax / 100) * 0.09;
  const spend = c.gdp * ((c.policies.education + c.policies.health + c.policies.welfare + c.policies.military) / 400) * 0.07 + (c.war ? c.gdp * 0.03 : 0);
  const tradeBal = (c.sectors.find(s => s.key === 'oil')!.output * 0.02) * (c.policies.trade / 50) - c.gdp * 0.004;
  const balance = taxRev + tradeBal - spend - c.debt * 0.002;
  c.treasury = round2(c.treasury + balance);
  if (c.treasury < 0) { c.debt = round2(c.debt - c.treasury); c.treasury = 0; c.inflation = clamp(c.inflation + 0.6, 0, 80); }
  else c.inflation = round2(clamp(c.inflation * 0.92 + (balance < 0 ? 0.4 : -0.1), 0, 80));
  if (c.treasury > c.gdp * 0.2) c.debt = Math.max(0, round2(c.debt - c.gdp * 0.01));

  // --- ساخت‌وساز ---
  for (const item of [...c.construction]) {
    item.monthsLeft -= 1;
    if (item.monthsLeft <= 0) {
      const s = c.sectors.find(x => x.key === item.sector); if (s) s.capacity = round2(s.capacity + item.gain);
      if (item.kind === 'university') c.literacy = clamp(c.literacy + 1.5, 0, 100);
      if (item.kind === 'hospital') c.pops.forEach(p => { p.sol = clamp(p.sol + 1, 0, 100); });
      c.construction = c.construction.filter(x => x.id !== item.id);
      if (isPlayer) pushNews(w, 'اقتصاد', `ساخت «${item.name}» کامل شد`, 'پروژه عمرانی به بهره‌برداری رسید و ظرفیت تولید افزایش یافت.', c.id);
    }
  }

  // --- جمعیت (Pops) ---
  const eduBoost = c.policies.education / 100; const healthBoost = c.policies.health / 100;
  const birth = 0.0022 - eduBoost * 0.0006; const death = 0.0016 - healthBoost * 0.0007 + (c.war ? 0.0012 : 0);
  c.population = round2(Math.max(0.1, c.population * (1 + birth - death + (rnd(w) - 0.5) * 0.0004)));
  c.literacy = round2(clamp(c.literacy + eduBoost * 0.12 - 0.01, 0, 100));
  let radicalAvg = 0;
  for (const p of c.pops) {
    p.literacy = round2(clamp(p.literacy + eduBoost * 0.1, 0, 100));
    p.sol = round2(clamp(p.sol + (growth * 220) + (c.policies.welfare / 100 - 0.3) * 1.2 - (c.unemployment / 100) * 1.5 - (c.inflation / 100) * 1.2, 5, 100));
    p.radical = round2(clamp(p.radical + (p.sol < 40 ? 0.7 : -0.4) + (c.unemployment > 18 ? 0.5 : 0) + (c.war ? 0.3 : 0), 0, 100));
    radicalAvg += p.radical * p.share;
  }

  // --- سیاست: مشروعیت، ثبات، کودتا/انقلاب ---
  c.legitimacy = round2(clamp(c.legitimacy + (growth > 0 ? 0.15 : -0.3) - (c.inflation > 25 ? 0.5 : 0) - (radicalAvg > 45 ? 0.6 : 0) + (c.policies.labor / 100 - 0.4) * 0.2, 0, 100));
  c.stability = round2(clamp(c.stability + (c.legitimacy - 50) * 0.02 - (radicalAvg > 50 ? 0.8 : 0) - (c.war ? 0.4 : 0) + (rnd(w) - 0.5) * 0.4, 0, 100));
  if (c.stability < 18 && rnd(w) < 0.18) {
    const kind = rnd(w) < 0.5 ? 'کودتای نظامی' : 'انقلاب مردمی';
    c.stability = 45; c.legitimacy = 35; c.treasury = Math.max(0, c.treasury * 0.6);
    c.gov = kind === 'کودتای نظامی' ? 'دیکتاتوری نظامی' : 'جمهوری پارلمانی';
    c.leaderFa = kind === 'کودتای نظامی' ? 'شورای نظامی' : 'دولت موقت'; c.leaderEn = kind === 'کودتای نظامی' ? 'Military Council' : 'Provisional Government';
    pushNews(w, 'سیاست', `${kind} در ${c.nameFa}`, `ناآرامی‌های انباشته به ${kind} انجامید و حکومت تغییر کرد. (نتیجه شبیه‌سازی — تاریخ جایگزین)`, c.id, true);
  }

  // --- فناوری ---
  c.researchPoints = round2(c.researchPoints + (c.literacy / 100) * 6 + (c.policies.education / 100) * 4 + (c.techs.includes('computing') ? 2 : 0));
  if (c.research) {
    const def = TECHS.find(t => t.id === c.research!.techId)!;
    c.research.progress += c.researchPoints; c.researchPoints = 0;
    if (c.research.progress >= def.cost) {
      c.techs.push(def.id); c.research = null;
      c.sectors.forEach(s => { s.tech = clamp(s.tech + 0.3, 0, 10); });
      pushNews(w, 'فناوری', `«${def.nameFa}» در ${c.nameFa} محقق شد`, def.desc + ' — ' + def.bonus, c.id, isPlayer);
    }
  }

  // --- جنگ ---
  if (c.war) {
    const e = w.countries[c.war.enemy];
    if (e) {
      const mine = militaryPower(c); const theirs = militaryPower(e);
      const drift = clamp((mine - theirs) / Math.max(10, mine + theirs) * 14 + (rnd(w) - 0.5) * 3, -6, 6);
      c.war.front = round2(clamp(c.war.front + drift, -100, 100));
      c.war.months += 1; c.war.exhaustion = round2(clamp(c.war.exhaustion + 2.2 + Math.abs(drift) * 0.2, 0, 100));
      const loss = Math.max(1, Math.round((mine + theirs) * (0.4 + rnd(w) * 0.5)));
      c.war.casualties += loss; c.population = Math.max(0.1, round2(c.population - loss / 1000));
      c.military.morale = round2(clamp(c.military.morale - 0.4, 5, 100));
      if (c.war.front >= 100 || c.war.front <= -100 || c.war.exhaustion >= 100) endWar(w, c, e);
    } else c.war = null;
  }
}

export function endWar(w: World, a: Country, b: Country) {
  const winner = (a.war?.front ?? 0) >= 0 ? a : b; const loser = winner === a ? b : a;
  const reparations = round2(Math.max(0.3, loser.gdp * 0.08));
  loser.treasury = Math.max(0, loser.treasury - reparations); loser.debt = round2(loser.debt + reparations);
  winner.treasury = round2(winner.treasury + reparations);
  loser.stability = clamp(loser.stability - 12, 0, 100); loser.military.army = Math.max(1, round2(loser.military.army * 0.7));
  a.war = null; b.war = null;
  a.relations[b.id] = clamp((a.relations[b.id] ?? 0) - 30, -100, 100); b.relations[a.id] = a.relations[b.id];
  pushNews(w, 'جنگ', `پایان جنگ ${a.nameFa} و ${b.nameFa}`, `${winner.nameFa} پیروز شد؛ ${loser.nameFa} ${reparations} میلیارد دلار غرامت پرداخت و بخشی از توان نظامی‌اش را از دست داد.`, winner.id, true);
}

export function declareWar(w: World, attackerId: string, defenderId: string, justification = 'ادعای سرزمینی'): boolean {
  const a = w.countries[attackerId]; const d = w.countries[defenderId];
  if (!a || !d || a.war || d.war || attackerId === defenderId) return false;
  a.war = { enemy: defenderId, front: 0, exhaustion: 0, casualties: 0, months: 0, justification };
  d.war = { enemy: attackerId, front: 0, exhaustion: 0, casualties: 0, months: 0, justification };
  a.relations[defenderId] = -90; d.relations[attackerId] = -90;
  pushNews(w, 'جنگ', `اعلان جنگ ${a.nameFa} به ${d.nameFa}`, `بهانه جنگ: ${justification}. جبهه‌ها شکل گرفتند و بسیج عمومی آغاز شد.`, attackerId, true);
  return true;
}

export function startConstruction(c: Country, kindKey: string): boolean {
  const def = CONSTRUCTION_KINDS.find(k => k.kind === kindKey); if (!def) return false;
  const cost = round2(def.cost * Math.max(0.5, c.gdp / 20));
  if (c.treasury < cost || c.construction.length >= 4) return false;
  c.treasury = round2(c.treasury - cost);
  c.construction.push({ id: `${kindKey}-${Date.now()}-${c.construction.length}`, kind: def.kind, name: def.name, monthsLeft: def.months, totalMonths: def.months, cost, sector: def.sector, gain: def.gain });
  return true;
}

export function startResearch(c: Country, techId: string): boolean {
  const def = TECHS.find(t => t.id === techId); if (!def || c.techs.includes(techId) || c.research) return false;
  if (!def.prereq.every(p => c.techs.includes(p))) return false;
  c.research = { techId, progress: 0 }; return true;
}

// هوش مصنوعی کاربردی کشورها (ماهیانه برای قدرت‌های بزرگ، سه‌ماهه برای کوچک‌ها)
function aiTurn(w: World, c: Country) {
  if (c.id === w.playerId) return;
  const major = c.gdp > 25;
  if (!major && (w.year * 12 + w.month) % 3 !== 0) return;
  if (!c.research) {
    const avail = TECHS.filter(t => !c.techs.includes(t.id) && t.prereq.every(p => c.techs.includes(p)));
    if (avail.length) startResearch(c, avail[Math.floor(rnd(w) * avail.length)].id);
  }
  if (c.treasury > c.gdp * 0.08 && c.construction.length < 2) {
    const kinds = CONSTRUCTION_KINDS.map(k => k.kind);
    startConstruction(c, kinds[Math.floor(rnd(w) * kinds.length)]);
  }
  if (c.stability < 35) { c.policies.welfare = clamp(c.policies.welfare + 5, 0, 100); c.policies.tax = clamp(c.policies.tax - 3, 0, 60); }
  if (c.treasury < 0.2) c.policies.tax = clamp(c.policies.tax + 3, 0, 60);
  // دیپلماسی/جنگ: دشمنی شدید + برتری نظامی → احتمال جنگ
  if (!c.war && c.military.readiness > 45) {
    for (const [oid, rel] of Object.entries(c.relations)) {
      const o = w.countries[oid];
      if (o && rel < -65 && !o.war && militaryPower(c) > militaryPower(o) * 1.5 && rnd(w) < 0.04) { declareWar(w, c.id, oid, 'اختلاف مرزی و تاریخی'); break; }
    }
  }
  // بهبود روابط با هم‌ایدئولوژی‌ها
  for (const o of Object.values(w.countries)) {
    if (o.id === c.id) continue;
    const cur = c.relations[o.id] ?? 0;
    const drift = o.ideology === c.ideology ? 0.3 : (o.ideology === 'کمونیستی') !== (c.ideology === 'کمونیستی') ? -0.2 : 0;
    c.relations[o.id] = round2(clamp(cur + drift + (rnd(w) - 0.5) * 0.3, -100, 100));
  }
}

export function tick(w: World): World {
  if (w.over || w.pendingEvent) return w;
  for (const c of Object.values(w.countries)) tickCountry(w, c);
  for (const c of Object.values(w.countries)) aiTurn(w, c);
  w.month += 1; if (w.month > 12) { w.month = 1; w.year += 1; }
  // رویدادهای تاریخی
  for (const ev of EVENTS) {
    if (ev.year === w.year && ev.month === w.month && !w.firedEvents.includes(ev.id)) {
      const relevant = ev.countries.includes('ALL') || ev.countries.includes(w.playerId);
      w.firedEvents.push(ev.id);
      if (relevant) { w.pendingEvent = ev.id; pushNews(w, 'تاریخ', ev.titleFa, ev.bodyFa, undefined, true); break; }
      // برای کشورهای AI: انتخاب تصادفی قطعی
      for (const cid of ev.countries) { const c = w.countries[cid]; if (c && cid !== w.playerId) ev.choices[Math.floor(rnd(w) * ev.choices.length)].apply(c, w); }
      pushNews(w, 'تاریخ', ev.titleFa, ev.bodyFa, undefined, false);
    }
  }
  recordHistory(w);
  return w;
}

export function applyEventChoice(w: World, choiceIdx: number): string {
  const ev = EVENTS.find(e => e.id === w.pendingEvent); if (!ev) return '';
  const p = w.countries[w.playerId];
  const msg = ev.choices[choiceIdx]?.apply(p, w) ?? '';
  w.pendingEvent = null;
  pushNews(w, 'تصمیم', ev.titleFa, msg, w.playerId, true);
  return msg;
}

export function serialize(w: World): string { return JSON.stringify(w); }
export function deserialize(json: string): World {
  const w = JSON.parse(json) as World;
  if (typeof w.year !== 'number' || !w.countries || !w.countries[w.playerId]) throw new Error('فایل ذخیره نامعتبر است');
  return w;
}
export function advanceDate(year: number, month: number, months: number): { year: number; month: number } {
  const total = (year * 12 + (month - 1)) + months;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}
