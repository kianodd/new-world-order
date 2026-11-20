import { useEffect, useRef, useState } from 'react';
import { Application, Graphics, Container, Text, TextStyle } from 'pixi.js';
import type { World } from '../engine/types';
import type { MapMode, Perf } from '../store';
import { loadWorldFeatures, WORLD_W, WORLD_H, type GeoCountry } from '../map/geo';

export interface GeoSelection { iso: string; nameFa: string; nameEn: string; engineId: string | null; note1946?: string }

interface Props {
  world: World; mode: MapMode; selected: string | null; selectedIso: string | null; perf: Perf;
  onSelect: (id: string) => void; onSelectGeo: (g: GeoSelection) => void;
}

function colorFor(c: GeoCountry, w: World, m: MapMode): string {
  const e = c.engineId ? w.countries[c.engineId] : undefined;
  if (!e) return '#33415c';
  if (m === 'economic') { const t = Math.min(1, e.gdp / 200); return t > 0.5 ? '#2e9e6b' : t > 0.15 ? '#c9a227' : '#5d6d7e'; }
  if (m === 'population') { const t = Math.min(1, e.population / 300); return t > 0.4 ? '#b03a5b' : t > 0.1 ? '#e07b39' : '#5d6d7e'; }
  if (m === 'ideology') return e.ideology === 'کمونیستی' ? '#c0392b' : e.ideology === 'دموکراتیک' ? '#3b6fd4' : e.ideology === 'سلطنت‌طلب' ? '#c9a227' : '#7d5ba6';
  if (m === 'war') return e.war ? '#e74c3c' : e.id === w.playerId ? '#c9a227' : '#3a4a63';
  return e.color;
}

// نقشه واقعی جهان (Natural Earth) با PixiJS — پیش‌محاسبه یک‌باره، زوم/پن با تبدیل کانتینر، برچسب فارسی در زوم بالا
export default function MapView({ world, mode, selected, selectedIso, perf, onSelect, onSelectGeo }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ world, mode, selected, selectedIso, perf });
  stateRef.current = { world, mode, selected, selectedIso, perf };
  const cbRef = useRef({ onSelect, onSelectGeo });
  cbRef.current = { onSelect, onSelectGeo };
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let app: Application | null = null; let destroyed = false;
    const el = ref.current; if (!el) return;
    (async () => {
      try {
        const features = await loadWorldFeatures();
        if (destroyed) return;
        app = new Application();
        await app.init({ resizeTo: el, background: '#0d1a2e', antialias: true });
        if (destroyed) { app.destroy(); return; }
        el.appendChild(app.canvas);
        const ocean = new Graphics(); app.stage.addChild(ocean);
        const root = new Container(); app.stage.addChild(root);
        const labelLayer = new Container(); root.addChild(labelLayer);

        // ساخت یک‌باره گرافیک هر کشور
        const gfx = new Map<string, Graphics>();
        for (const c of features) {
          const g = new Graphics();
          g.eventMode = 'static'; g.cursor = 'pointer';
          g.on('pointertap', () => {
            if (c.engineId) cbRef.current.onSelect(c.engineId);
            else cbRef.current.onSelectGeo({ iso: c.iso, nameFa: c.nameFa, nameEn: c.nameEn, engineId: null, note1946: c.note1946 });
          });
          gfx.set(c.iso, g); root.addChild(g);
        }
        // برچسب‌ها (فقط کشورهای بزرگ‌تر؛ نمایش وابسته به زوم و تنظیم عملکرد)
        const labelStyle = new TextStyle({ fontFamily: 'Vazirmatn, sans-serif', fontSize: 11, fill: '#f3ead3', stroke: { color: '#0b1220', width: 3 } });
        const labels: { t: Text; area: number }[] = [];
        for (const c of features) {
          if (c.area < 120) continue;
          const t = new Text({ text: c.nameFa, style: labelStyle });
          t.anchor.set(0.5); t.position.set(c.centroid[0], c.centroid[1]); t.visible = false;
          labelLayer.addChild(t); labels.push({ t, area: c.area });
        }

        let scale = 1; let ox = 0; let oy = 0;
        const applyTransform = () => {
          const W = el.clientWidth; const H = el.clientHeight;
          const fit = Math.min(W / WORLD_W, H / WORLD_H) * scale;
          root.scale.set(fit);
          root.position.set((W - WORLD_W * fit) / 2 + ox, (H - WORLD_H * fit) / 2 + oy);
          ocean.clear().rect(0, 0, W, H).fill('#0d1a2e');
          const p = stateRef.current.perf;
          const showLabels = p !== 'low' && scale >= 1.6;
          for (const { t, area } of labels) t.visible = showLabels && (p === 'high' || area > 600 || scale >= 2.6);
        };
        const recolor = () => {
          const { world: w, mode: m, selected: sel, selectedIso: selIso } = stateRef.current;
          for (const c of features) {
            const g = gfx.get(c.iso); if (!g) continue;
            const isSel = (c.engineId && c.engineId === sel) || c.iso === selIso;
            g.clear();
            for (const poly of c.polygons) {
              for (const ring of poly) {
                if (ring.length < 3) continue;
                g.poly(ring.flatMap(([x, y]) => [x, y])).fill(colorFor(c, w, m)).stroke({ color: isSel ? '#ffffff' : '#0b1220', width: isSel ? 1.6 : 0.5 });
              }
            }
          }
        };
        recolor(); applyTransform();
        const iv = setInterval(recolor, 1500);

        // ژست‌ها: کشیدن، زوم دو انگشتی (pointer)، چرخ موس، دوبار لمس
        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.touchAction = 'none';
        const pointers = new Map<number, { x: number; y: number }>();
        let lastPinch = 0; let lastTap = 0; let moved = 0;
        const zoomAt = (cx: number, cy: number, f: number) => {
          const rect = canvas.getBoundingClientRect();
          const px = cx - rect.left; const py = cy - rect.top;
          const W = el.clientWidth; const H = el.clientHeight;
          const fitBefore = Math.min(W / WORLD_W, H / WORLD_H) * scale;
          const wx = (px - ((W - WORLD_W * fitBefore) / 2 + ox)) / fitBefore;
          const wy = (py - ((H - WORLD_H * fitBefore) / 2 + oy)) / fitBefore;
          scale = Math.max(0.8, Math.min(8, scale * f));
          const fitAfter = Math.min(W / WORLD_W, H / WORLD_H) * scale;
          ox = px - wx * fitAfter - (W - WORLD_W * fitAfter) / 2;
          oy = py - wy * fitAfter - (H - WORLD_H * fitAfter) / 2;
          applyTransform();
        };
        canvas.addEventListener('pointerdown', (e) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; });
        canvas.addEventListener('pointermove', (e) => {
          const prev = pointers.get(e.pointerId); if (!prev) return;
          pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.size === 1) { ox += e.clientX - prev.x; oy += e.clientY - prev.y; moved += Math.abs(e.clientX - prev.x) + Math.abs(e.clientY - prev.y); applyTransform(); }
          else if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (lastPinch) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / lastPinch);
            lastPinch = d;
          }
        });
        const up = (e: PointerEvent) => {
          pointers.delete(e.pointerId); if (pointers.size < 2) lastPinch = 0;
          if (moved < 6) {
            const now = performance.now();
            if (now - lastTap < 320) zoomAt(e.clientX, e.clientY, 1.7);
            lastTap = now;
          }
        };
        canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
        canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 0.9); }, { passive: false });
        (el as unknown as { __zoom?: (f: number) => void }).__zoom = (f) => { const r = canvas.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); };
        (el as unknown as { __reset?: () => void }).__reset = () => { scale = 1; ox = 0; oy = 0; applyTransform(); };
        setReady(true);
        return () => clearInterval(iv);
      } catch (e) {
        setErr('بارگذاری نقشه ناموفق بود. صفحه را تازه کنید.');
        console.error(e);
      }
    })();
    return () => { destroyed = true; app?.destroy(true); };
  }, []);

  const zoom = (f: number) => (ref.current as unknown as { __zoom?: (n: number) => void })?.__zoom?.(f);
  const reset = () => (ref.current as unknown as { __reset?: () => void })?.__reset?.();
  return (
    <div className="relative w-full" style={{ height: 'min(56vh, 560px)' }}>
      <div ref={ref} className="absolute inset-0 rounded-2xl overflow-hidden border border-line map-shell" aria-label="نقشه جهان" />
      {!ready && !err && <p className="absolute inset-0 flex items-center justify-center text-sm text-mute">در حال بارگذاری نقشه جهان…</p>}
      {err && <p className="absolute inset-0 flex items-center justify-center text-sm text-red-300 px-4 text-center">{err}</p>}
      <div className="absolute bottom-3 start-3 flex gap-2">
        <button className="btn" aria-label="بزرگ‌نمایی" onClick={() => zoom(1.3)}>+</button>
        <button className="btn" aria-label="کوچک‌نمایی" onClick={() => zoom(0.77)}>−</button>
        <button className="btn" onClick={reset}>بازنشانی</button>
      </div>
      <span className="absolute top-3 end-3 chip text-[11px]">Natural Earth • ۱۷۷ سرزمین</span>
    </div>
  );
}
