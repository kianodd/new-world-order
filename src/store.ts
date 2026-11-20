import { create } from 'zustand';
import type { World } from './engine/types';
import { createWorld, tick, applyEventChoice, declareWar, startConstruction, startResearch } from './engine/sim';
import { saveGame, loadGame } from './save';

export type Tab = 'world' | 'country' | 'economy' | 'politics' | 'diplomacy' | 'military' | 'tech' | 'reports';
export type MapMode = 'political' | 'economic' | 'population' | 'ideology' | 'war';
export type Perf = 'low' | 'med' | 'high';
export interface GeoSel { iso: string; nameFa: string; nameEn: string; engineId: string | null; note1946?: string }

interface State {
  world: World | null; tab: Tab; selected: string | null; selectedGeo: GeoSel | null; mapMode: MapMode;
  speed: 0 | 1 | 2 | 3; calendar: 'gregorian' | 'persian'; autoPause: boolean;
  perf: Perf; theme: 'dark' | 'light';
  toast: string;
  newGame: (id: string) => void; setTab: (t: Tab) => void; select: (id: string | null) => void;
  setMapMode: (m: MapMode) => void; setSpeed: (s: 0 | 1 | 2 | 3) => void;
  step: () => void; chooseEvent: (i: number) => void;
  setPolicy: (k: keyof World['countries'][string]['policies'], v: number) => void;
  build: (kind: string) => void; research: (id: string) => void;
  war: (target: string) => void; peace: () => void;
  ally: (target: string) => void; sanction: (target: string) => void;
  setCalendar: (c: 'gregorian' | 'persian') => void; setAutoPause: (b: boolean) => void;
  selectGeo: (g: GeoSel | null) => void; setPerf: (p: Perf) => void; setTheme: (t: 'dark' | 'light') => void;
  save: (slot: string, name: string) => Promise<void>; load: (slot: string) => Promise<void>;
  setWorld: (w: World) => void; say: (t: string) => void;
}

export const useGame = create<State>((set, get) => ({
  world: null, tab: 'world', selected: null, selectedGeo: null, mapMode: 'political', speed: 0,
  calendar: (localStorage.getItem('nwo-cal') as 'gregorian' | 'persian') || 'gregorian',
  autoPause: localStorage.getItem('nwo-autopause') !== '0', toast: '',
  perf: (localStorage.getItem('nwo-perf') as Perf) || 'med',
  theme: (localStorage.getItem('nwo-theme') as 'dark' | 'light') || 'dark',
  newGame: (id) => set({ world: createWorld(id), selected: id, tab: 'world', speed: 0, toast: 'بازی تازه از ۱ ژانویه ۱۹۴۶ آغاز شد' }),
  setTab: (tab) => set({ tab }), select: (selected) => set({ selected, selectedGeo: null }),
  selectGeo: (selectedGeo) => set({ selectedGeo, selected: null }),
  setPerf: (perf) => { localStorage.setItem('nwo-perf', perf); set({ perf }); },
  setTheme: (theme) => { localStorage.setItem('nwo-theme', theme); document.documentElement.classList.toggle('light', theme === 'light'); set({ theme }); },
  setMapMode: (mapMode) => set({ mapMode }), setSpeed: (speed) => set({ speed }),
  step: () => { const w = get().world; if (!w) return; const nw = tick(structuredClone(w)); if (nw.pendingEvent && get().autoPause) set({ world: nw, speed: 0 }); else set({ world: nw }); },
  chooseEvent: (i) => { const w = get().world; if (!w) return; const nw = structuredClone(w); const msg = applyEventChoice(nw, i); set({ world: nw, toast: msg }); },
  setPolicy: (k, v) => { const w = get().world; if (!w) return; const nw = structuredClone(w); nw.countries[nw.playerId].policies[k] = v; set({ world: nw }); },
  build: (kind) => { const w = get().world; if (!w) return; const nw = structuredClone(w); const ok = startConstruction(nw.countries[nw.playerId], kind); set({ world: nw, toast: ok ? 'ساخت‌وساز آغاز شد' : 'خزانه کافی نیست یا صف ساخت پر است' }); },
  research: (id) => { const w = get().world; if (!w) return; const nw = structuredClone(w); const ok = startResearch(nw.countries[nw.playerId], id); set({ world: nw, toast: ok ? 'پژوهش آغاز شد' : 'پیش‌نیاز یا پژوهش جاری مانع است' }); },
  war: (target) => { const w = get().world; if (!w) return; const nw = structuredClone(w); const ok = declareWar(nw, nw.playerId, target, 'ادعای سرزمینی و اختلاف تاریخی'); set({ world: nw, toast: ok ? 'جنگ اعلام شد' : 'اعلان جنگ ممکن نیست (جنگ جاری)' }); },
  peace: () => { const w = get().world; if (!w) return; const nw = structuredClone(w); const p = nw.countries[nw.playerId]; if (p.war) { const e = nw.countries[p.war.enemy]; if (e) e.war = null; p.war = null; p.stability = Math.min(100, p.stability + 5); } set({ world: nw, toast: 'صلح برقرار شد' }); },
  ally: (target) => { const w = get().world; if (!w) return; const nw = structuredClone(w); const p = nw.countries[nw.playerId]; const t = nw.countries[target]; if (p && t && (p.relations[target] ?? 0) > 20 && !p.allies.includes(target)) { p.allies.push(target); t.allies.push(nw.playerId); set({ world: nw, toast: `ائتلاف با ${t.nameFa} بسته شد` }); } else set({ toast: 'برای ائتلاف، روابط باید بالای ۲۰ باشد' }); },
  sanction: (target) => { const w = get().world; if (!w) return; const nw = structuredClone(w); const p = nw.countries[nw.playerId]; if (!p.sanctions.includes(target)) p.sanctions.push(target); p.relations[target] = Math.max(-100, (p.relations[target] ?? 0) - 20); set({ world: nw, toast: 'تحریم اعمال شد' }); },
  setCalendar: (calendar) => { localStorage.setItem('nwo-cal', calendar); set({ calendar }); },
  setAutoPause: (autoPause) => { localStorage.setItem('nwo-autopause', autoPause ? '1' : '0'); set({ autoPause }); },
  save: async (slot, name) => { const w = get().world; if (!w) return; await saveGame(slot, name, w); set({ toast: 'بازی ذخیره شد' }); },
  load: async (slot) => { const w = await loadGame(slot); if (w) set({ world: w, selected: w.playerId, speed: 0, toast: 'بازی بارگذاری شد' }); else set({ toast: 'ذخیره‌ای یافت نشد' }); },
  setWorld: (world) => set({ world, selected: world.playerId, speed: 0 }),
  say: (toast) => set({ toast }),
}));
