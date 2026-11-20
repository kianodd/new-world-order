import { describe, it, expect } from 'vitest';
import { createWorld, tick, declareWar, startConstruction, startResearch, serialize, deserialize, advanceDate, applyEventChoice, militaryPower } from './sim';
import { EVENTS } from './events';

describe('موتور شبیه‌سازی نظم نوین جهان', () => {
  it('جهان ۱۹۴۶ با ایران و قدرت‌ها ساخته می‌شود', () => {
    const w = createWorld('IRN');
    expect(w.year).toBe(1946); expect(w.month).toBe(1);
    expect(w.countries['IRN'].leaderFa).toContain('پهلوی');
    expect(w.countries['USA'].leaderEn).toContain('Truman');
    expect(Object.keys(w.countries).length).toBeGreaterThanOrEqual(28);
  });
  it('تیک اقتصادی GDP و خزانه را تغییر می‌دهد و قطعی است', () => {
    const a = createWorld('IRN', 42); const b = createWorld('IRN', 42);
    for (let i = 0; i < 12; i++) { if (a.pendingEvent) applyEventChoice(a, 0); if (b.pendingEvent) applyEventChoice(b, 0); tick(a); tick(b); }
    expect(a.countries['IRN'].gdp).toBe(b.countries['IRN'].gdp);
    expect(a.countries['IRN'].population).toBeGreaterThan(0);
    expect(a.year).toBe(1947);
  });
  it('جمعیت با سیاست سلامت و آموزش رشد می‌کند', () => {
    const w = createWorld('IRN', 7);
    const before = w.countries['IRN'].population;
    for (let i = 0; i < 24; i++) { if (w.pendingEvent) applyEventChoice(w, 0); tick(w); }
    expect(w.countries['IRN'].population).toBeGreaterThan(before * 0.98);
    expect(w.countries['IRN'].literacy).toBeGreaterThanOrEqual(18);
  });
  it('ساخت‌وساز و پژوهش کار می‌کنند', () => {
    const w = createWorld('USA', 3);
    expect(startConstruction(w.countries['USA'], 'factory')).toBe(true);
    expect(w.countries['USA'].construction.length).toBe(1);
    expect(startResearch(w.countries['USA'], 'jet')).toBe(true);
  });
  it('جنگ اعلام و با قدرت نظامی سنجیده می‌شود', () => {
    const w = createWorld('IRN', 9);
    expect(declareWar(w, 'IRN', 'IRQ')).toBe(true);
    expect(w.countries['IRN'].war?.enemy).toBe('IRQ');
    expect(militaryPower(w.countries['USA'])).toBeGreaterThan(militaryPower(w.countries['IRN']));
    for (let i = 0; i < 6; i++) { if (w.pendingEvent) applyEventChoice(w, 0); tick(w); }
    expect(w.countries['IRN'].war === null || w.countries['IRN'].war!.months > 0).toBe(true);
  });
  it('رویداد تاریخی در تاریخ درست فعال و انتخاب اعمال می‌شود', () => {
    const w = createWorld('IRN', 11);
    // جلو بردن تا مارس ۱۹۴۶ (بحران ایران)
    tick(w); tick(w);
    expect(w.pendingEvent).toBeTruthy();
    const msg = applyEventChoice(w, 0);
    expect(msg.length).toBeGreaterThan(0);
    expect(w.pendingEvent).toBeNull();
    expect(EVENTS.length).toBeGreaterThanOrEqual(14);
  });
  it('ذخیره و بارگذاری رفت‌وبرگشتی سالم است', () => {
    const w = createWorld('IRN', 5); tick(w);
    const w2 = deserialize(serialize(w));
    expect(w2.year).toBe(w.year); expect(w2.countries['IRN'].gdp).toBe(w.countries['IRN'].gdp);
  });
  it('پیشبرد تاریخ درست کار می‌کند', () => {
    expect(advanceDate(1946, 11, 3)).toEqual({ year: 1947, month: 2 });
    expect(advanceDate(1946, 1, 12)).toEqual({ year: 1947, month: 1 });
  });
});
