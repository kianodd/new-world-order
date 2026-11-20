import { describe, it, expect } from 'vitest';
import { projectLonLat, pointInRing, splitRing, hitTest, loadWorldFeatures, ISO_TO_ENGINE, ENGINE_TO_ISO, WORLD_W, WORLD_H, type GeoCountry } from './geo';
import { buildCountries } from '../engine/data';

describe('نقشه واقعی جهان (Natural Earth)', () => {
  it('پروجکشن تهران و واشینگتن در محدوده جهان و ترتیب درست است', () => {
    const tehran = projectLonLat(51.4, 35.7);
    const dc = projectLonLat(-77, 38.9);
    const sydney = projectLonLat(151.2, -33.9);
    for (const [x, y] of [tehran, dc, sydney]) {
      expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(WORLD_W);
      expect(y).toBeGreaterThan(0); expect(y).toBeLessThan(WORLD_H);
    }
    expect(dc[0]).toBeLessThan(tehran[0]);
    expect(sydney[1]).toBeGreaterThan(tehran[1]); // نیم‌کره جنوبی پایین‌تر
  });

  it('آزمون نقطه در چندضلعی درست کار می‌کند', () => {
    const sq: [number, number][] = [[0, 0], [10, 0], [10, 10], [0, 10]];
    expect(pointInRing(5, 5, sq)).toBe(true);
    expect(pointInRing(15, 5, sq)).toBe(false);
    expect(pointInRing(-1, 5, sq)).toBe(false);
  });

  it('حلقه ضد نصف‌النهار شکسته می‌شود', () => {
    const ring: [number, number][] = [[990, 100], [995, 110], [10, 120], [20, 130]];
    const segs = splitRing(ring);
    expect(segs.length).toBe(2);
  });

  it('نگاشت ISO به موتور هر ۳۰ کشور قابل‌بازی را پوشش می‌دهد', () => {
    const engineIds = Object.keys(buildCountries());
    expect(engineIds.length).toBe(30);
    for (const id of engineIds) {
      expect(ENGINE_TO_ISO[id], `کشور ${id} نگاشت نقشه ندارد`).toBeTruthy();
      expect(ISO_TO_ENGINE[ENGINE_TO_ISO[id]]).toBe(id);
    }
  });

  it('داده Natural Earth بارگذاری و ۱۷۷ سرزمین با ایران قابل اصابت است', async () => {
    const feats = await loadWorldFeatures();
    expect(feats.length).toBeGreaterThanOrEqual(170);
    const iran = feats.find(f => f.iso === '364');
    expect(iran?.engineId).toBe('IRN');
    expect(iran?.nameFa).toBe('ایران');
    const hit = hitTest(feats, iran!.centroid[0], iran!.centroid[1]);
    expect(hit?.iso).toBe('364');
    const usa = feats.find(f => f.iso === '840');
    expect(usa?.engineId).toBe('USA');
    // سرزمین غیرقابل‌بازی نمونه: الجزایر با یادداشت ۱۹۴۶
    const alg = feats.find(f => f.iso === '012');
    expect(alg?.engineId).toBeNull();
    expect(alg?.note1946).toContain('۱۹۴۶');
    const playable = feats.filter(f => f.engineId);
    expect(playable.length).toBe(30);
    const dummy: GeoCountry[] = feats;
    expect(hitTest(dummy, 2, 2)).toBeNull(); // اقیانوس
  });
});
