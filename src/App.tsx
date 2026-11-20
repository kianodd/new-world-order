import { useEffect, useMemo, useRef, useState } from 'react';
import { Globe2, Landmark, TrendingUp, Scale, Handshake, Shield, FlaskConical, Newspaper, Pause, Play, FastForward, Save, Download, Upload, Trash2, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useGame, type Tab, type MapMode } from './store';
import MapView from './components/MapView';
import { buildCountries, TECHS, CONSTRUCTION_KINDS } from './engine/data';
import { EVENTS } from './engine/events';
import { militaryPower } from './engine/sim';
import { listSaves, deleteSave, exportSave, importSave, type SaveMeta } from './save';

const nf = new Intl.NumberFormat('fa-IR');
const fmt = (n: number, d = 1) => nf.format(Math.round(n * 10 ** d) / 10 ** d);
const MONTHS_FA = ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'];

function dateLabel(year: number, month: number, cal: string) {
  if (cal === 'persian') {
    try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long' }).format(new Date(Date.UTC(year, month - 1, 1))); } catch { /* fallback */ }
  }
  return `${MONTHS_FA[month - 1]} ${nf.format(year)}`;
}
const Bar = ({ v, color = '#c9a227' }: { v: number; color?: string }) => (
  <div className="h-2 rounded-full bg-panel2 overflow-hidden"><div className="h-full" style={{ width: `${Math.max(0, Math.min(100, v))}%`, background: color }} /></div>
);
const Stat = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-3 py-1 text-sm"><span className="text-mute">{k}</span><b>{v}</b></div>
);
const Slider = ({ label, value, onChange, max = 100 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) => (
  <label className="block py-1"><span className="flex justify-between text-sm"><span>{label}</span><b>{fmt(value, 0)}</b></span>
    <input type="range" min={0} max={max} value={value} onChange={e => onChange(Number(e.target.value))} aria-label={label} /></label>
);

const TABS: { id: Tab; label: string; Icon: typeof Globe2 }[] = [
  { id: 'world', label: 'جهان', Icon: Globe2 }, { id: 'country', label: 'کشور', Icon: Landmark },
  { id: 'economy', label: 'اقتصاد', Icon: TrendingUp }, { id: 'politics', label: 'سیاست', Icon: Scale },
  { id: 'diplomacy', label: 'دیپلماسی', Icon: Handshake }, { id: 'military', label: 'ارتش', Icon: Shield },
  { id: 'tech', label: 'فناوری', Icon: FlaskConical }, { id: 'reports', label: 'گزارش‌ها', Icon: Newspaper },
];
const MODES: { id: MapMode; label: string }[] = [
  { id: 'political', label: 'سیاسی' }, { id: 'economic', label: 'اقتصادی' }, { id: 'population', label: 'جمعیت' },
  { id: 'ideology', label: 'ایدئولوژی' }, { id: 'war', label: 'جنگ' },
];
const REGIONS: { id: string; label: string; ids: string[] }[] = [
  { id: 'all', label: 'همه', ids: [] },
  { id: 'me', label: 'خاورمیانه', ids: ['IRN', 'TUR', 'EGY', 'SAU', 'IRQ', 'AFG'] },
  { id: 'eu', label: 'اروپا', ids: ['GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'POL', 'YUG', 'GRC', 'NLD', 'SWE', 'SUN'] },
  { id: 'as', label: 'آسیا و اقیانوسیه', ids: ['CHN', 'IND', 'JPN', 'IDN', 'KOR', 'AUS'] },
  { id: 'am', label: 'آمریکا', ids: ['USA', 'BRA', 'MEX', 'ARG', 'CAN'] },
  { id: 'af', label: 'آفریقا', ids: ['ETH', 'ZAF'] },
];

export default function App() {
  const g = useGame();
  const [saves, setSaves] = useState<SaveMeta[]>([]);
  const [saveName, setSaveName] = useState('کمپین من');
  const [newsCat, setNewsCat] = useState('همه');
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [drawerTab, setDrawerTab] = useState<'sum' | 'eco' | 'pol' | 'mil'>('sum');
  const fileRef = useRef<HTMLInputElement>(null);
  const catalog = useMemo(() => Object.values(buildCountries()).sort((a, b) => b.gdp - a.gdp), []);

  useEffect(() => { listSaves().then(setSaves).catch(() => setSaves([])); }, [g.world]);
  useEffect(() => { document.documentElement.classList.toggle('light', g.theme === 'light'); }, [g.theme]);
  useEffect(() => {
    if (!g.world || g.speed === 0 || g.world.pendingEvent) return;
    const ms = g.speed === 1 ? 1600 : g.speed === 2 ? 700 : 250;
    const iv = setInterval(() => g.step(), ms);
    return () => clearInterval(iv);
  }, [g.world, g.speed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!g.world) {
    return (
      <main className="min-h-full max-w-3xl mx-auto p-4 pb-10">
        <header className="text-center py-8">
          <h1 className="text-4xl font-black text-gold2">نظم نوین جهان</h1>
          <p className="text-mute mt-2">The New World Order — بازی استراتژی کلان از ۱ ژانویه ۱۹۴۶</p>
          <p className="mt-3 text-sm leading-7">کشوری را انتخاب کنید و با اقتصاد، سیاست، دیپلماسی، فناوری و جنگ، تاریخ را از نو بنویسید. جهان حتی بدون شما هم حرکت می‌کند.</p>
        </header>
        <div className="flex gap-2 flex-wrap mb-3">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="جست‌وجوی کشور یا رهبر…" aria-label="جست‌وجوی کشور" className="flex-1 min-w-[180px]" />
          {REGIONS.map(r => <button key={r.id} className={`btn ${region === r.id ? 'btn-gold' : ''}`} onClick={() => setRegion(r.id)}>{r.label}</button>)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {catalog.filter(c => (region === 'all' || REGIONS.find(r => r.id === region)!.ids.includes(c.id)) && (query.trim() === '' || c.nameFa.includes(query) || c.nameEn.toLowerCase().includes(query.toLowerCase()) || c.leaderFa.includes(query))).map(c => (
            <button key={c.id} onClick={() => g.newGame(c.id)} className="card text-start hover:border-gold transition-colors" style={{ minHeight: 88 }}>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded" style={{ background: c.color }} /><b className="text-lg">{c.nameFa}</b><span className="text-xs text-mute" dir="ltr">{c.nameEn}</span></span>
              <span className="block text-sm text-mute mt-1">پایتخت: {c.capitalFa} • رهبر: {c.leaderFa}</span>
              <span className="block text-sm mt-1">جمعیت {fmt(c.population)} میلیون • تولید ناخالص {fmt(c.gdp, 0)} میلیارد دلار • {c.gov}</span>
            </button>
          ))}
        </div>
        <section className="card mt-4">
          <h2 className="font-bold mb-2">ادامه بازی ذخیره‌شده</h2>
          {saves.length === 0 ? <p className="text-sm text-mute">هنوز ذخیره‌ای نیست.</p> : saves.map(s => (
            <div key={s.slot} className="flex items-center gap-2 py-2 border-b border-line last:border-0">
              <span className="flex-1 text-sm"><b>{s.name}</b> — {s.country} • {s.date}</span>
              <button className="btn" onClick={() => g.load(s.slot)}>بارگذاری</button>
              <button className="btn" aria-label="حذف ذخیره" onClick={async () => { await deleteSave(s.slot); setSaves(await listSaves()); }}><Trash2 size={18} /></button>
            </div>
          ))}
          <button className="btn mt-3" onClick={() => fileRef.current?.click()}><Upload size={18} className="inline" /> وارد کردن فایل ذخیره</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) { try { g.setWorld(await importSave(f)); } catch { g.say('فایل ذخیره نامعتبر است'); } } }} />
        </section>
        {g.toast && <p className="text-center text-gold2 mt-3">{g.toast}</p>}
      </main>
    );
  }

  const w = g.world; const me = w.countries[w.playerId];
  const sel = g.selected ? w.countries[g.selected] : me;
  const ev = EVENTS.find(e => e.id === w.pendingEvent);
  const cats = ['همه', ...Array.from(new Set(w.news.map(n => n.cat)))];
  const news = newsCat === 'همه' ? w.news : w.news.filter(n => n.cat === newsCat);

  return (
    <div className="min-h-full max-w-5xl mx-auto flex flex-col">
      <header className="sticky top-0 z-20 bg-ink/95 backdrop-blur border-b border-line px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-4 h-4 rounded" style={{ background: me.color }} />
          <b>{me.nameFa}</b><span className="text-mute text-sm">{dateLabel(w.year, w.month, g.calendar)}</span>
          <span className="chip">خزانه {fmt(me.treasury)} م$</span><span className="chip">تولید ناخالص {fmt(me.gdp, 0)} م$</span><span className="chip">ثبات {fmt(me.stability, 0)}</span>{me.war && <span className="chip chip-war">در جنگ با {w.countries[me.war.enemy]?.nameFa}</span>}
          <span className="flex-1" />
          <div className="flex gap-1" role="group" aria-label="کنترل زمان">
            <button className={`btn ${g.speed === 0 ? 'btn-gold' : ''}`} aria-label="توقف" onClick={() => g.setSpeed(0)}><Pause size={18} /></button>
            <button className={`btn ${g.speed === 1 ? 'btn-gold' : ''}`} aria-label="سرعت عادی" onClick={() => g.setSpeed(1)}><Play size={18} /></button>
            <button className={`btn ${g.speed === 2 ? 'btn-gold' : ''}`} aria-label="سریع" onClick={() => g.setSpeed(2)}><FastForward size={18} /></button>
            <button className={`btn ${g.speed === 3 ? 'btn-gold' : ''}`} aria-label="بسیار سریع" onClick={() => g.setSpeed(3)}>»»</button>
            <button className="btn" onClick={() => g.step()}>ماه بعد</button>
          </div>
        </div>
        {g.toast && <p className="text-gold2 text-sm mt-1">{g.toast}</p>}
      </header>

      <main className="flex-1 p-3 pb-28 space-y-3">
        {g.tab === 'world' && <>
          <div className="flex gap-2 flex-wrap">{MODES.map(m => <button key={m.id} className={`btn ${g.mapMode === m.id ? 'btn-gold' : ''}`} onClick={() => g.setMapMode(m.id)}>{m.label}</button>)}</div>
          <MapView world={w} mode={g.mapMode} selected={g.selected} selectedIso={g.selectedGeo?.iso ?? null} perf={g.perf} onSelect={g.select} onSelectGeo={g.selectGeo} />
          <p className="text-xs text-mute">مرزهای نقشه تقریبی مدرن است (Natural Earth)؛ وضعیت سیاسی ۱۹۴۶ در داده‌های کشورها اعمال شده. روی هر سرزمین بزنید؛ با دو انگشت زوم، با کشیدن جابه‌جا و با دوبار لمس بزرگ‌نمایی کنید.</p>
          {g.selectedGeo && <section className="card">
            <div className="flex items-start gap-2"><h2 className="text-xl font-black flex-1">{g.selectedGeo.nameFa} <span className="text-sm text-mute font-normal" dir="ltr">{g.selectedGeo.nameEn}</span></h2>
              <button className="btn" aria-label="بستن" onClick={() => g.selectGeo(null)}><X size={18} /></button></div>
            <p className="text-sm leading-7 mt-1">کشور غیرقابل‌بازی در این نسخه — روی نقشه نمایش داده می‌شود اما در شبیه‌سازی ۱۹۴۶ کشور مستقلی نیست.</p>
            {g.selectedGeo.note1946 && <p className="text-sm leading-7 text-gold2">{g.selectedGeo.note1946}</p>}
          </section>}
          {sel && !g.selectedGeo && <section className="card">
            <div className="flex items-start gap-2"><span className="w-5 h-5 rounded shrink-0 mt-1" style={{ background: sel.color }} /><h2 className="text-xl font-black flex-1">{sel.nameFa} <span className="text-sm text-mute font-normal" dir="ltr">{sel.nameEn}</span></h2>
              <button className="btn" aria-label="بستن" onClick={() => g.select(null)}><X size={18} /></button></div>
            <div className="grid grid-cols-3 gap-2 my-2 text-center">
              <div className="mini-stat"><b>{fmt(sel.population)}</b><span>جمعیت (میلیون)</span></div>
              <div className="mini-stat"><b>{fmt(sel.gdp, 0)}</b><span>تولید ناخالص (م$)</span></div>
              <div className="mini-stat"><b>{fmt(sel.stability, 0)}</b><span>ثبات</span></div>
            </div>
            <div className="flex gap-1 flex-wrap" role="tablist" aria-label="جزئیات کشور">
              {([['sum', 'خلاصه'], ['eco', 'اقتصاد'], ['pol', 'سیاست'], ['mil', 'ارتش']] as const).map(([id, label]) => (
                <button key={id} role="tab" aria-selected={drawerTab === id} className={`btn ${drawerTab === id ? 'btn-gold' : ''}`} onClick={() => setDrawerTab(id)}>{label}</button>
              ))}
            </div>
            {drawerTab === 'sum' && <div className="mt-2">
              <Stat k="پایتخت" v={sel.capitalFa} /><Stat k="حکومت" v={sel.gov} /><Stat k="رهبر" v={`${sel.leaderFa} (${sel.leaderEn})`} />
              <Stat k="ایدئولوژی" v={sel.ideology} /><Stat k="سواد" v={`${fmt(sel.literacy, 0)}٪`} />
              <Stat k="روابط با شما" v={sel.id === me.id ? '—' : fmt(me.relations[sel.id] ?? 0, 0)} />
            </div>}
            {drawerTab === 'eco' && <div className="mt-2">
              <Stat k="خزانه" v={`${fmt(sel.treasury)} میلیارد دلار`} /><Stat k="بدهی" v={`${fmt(sel.debt)} میلیارد دلار`} />
              <Stat k="تورم" v={`${fmt(sel.inflation)}٪`} /><Stat k="بیکاری" v={`${fmt(sel.unemployment)}٪`} />
              {sel.sectors.slice(0, 4).map(s => <Stat key={s.key} k={s.name} v={`تولید ${fmt(s.output, 0)} / ظرفیت ${fmt(s.capacity, 0)}`} />)}
            </div>}
            {drawerTab === 'pol' && <div className="mt-2">
              <Stat k="مشروعیت" v={fmt(sel.legitimacy, 0)} /><Stat k="ثبات" v={fmt(sel.stability, 0)} />
              {sel.pops.slice(0, 4).map(p => <Stat key={p.cls} k={p.cls} v={`سطح زندگی ${fmt(p.sol, 0)} • رادیکال ${fmt(p.radical, 0)}`} />)}
            </div>}
            {drawerTab === 'mil' && <div className="mt-2">
              <Stat k="قدرت نظامی کل" v={fmt(militaryPower(sel), 0)} /><Stat k="زمینی / دریایی / هوایی" v={`${fmt(sel.military.army, 0)} / ${fmt(sel.military.navy, 0)} / ${fmt(sel.military.air, 0)}`} />
              <Stat k="آمادگی / لجستیک / روحیه" v={`${fmt(sel.military.readiness, 0)} / ${fmt(sel.military.logistics, 0)} / ${fmt(sel.military.morale, 0)}`} />
              {sel.war && <Stat k="جنگ جاری" v={`با ${w.countries[sel.war.enemy]?.nameFa ?? ''} • فرسودگی ${fmt(sel.war.exhaustion, 0)}٪`} />}
            </div>}
            {sel.id !== me.id && <div className="flex gap-2 flex-wrap mt-2">
              <button className="btn" onClick={() => g.ally(sel.id)}>پیشنهاد ائتلاف</button>
              <button className="btn" onClick={() => g.sanction(sel.id)}>تحریم</button>
              <button className="btn" onClick={() => g.war(sel.id)}>اعلان جنگ</button>
            </div>}
          </section>}
        </>}

        {g.tab === 'country' && <section className="card">
          <h2 className="text-xl font-black mb-2">{me.nameFa} — {me.gov}</h2>
          <Stat k="رهبر" v={`${me.leaderFa} (${me.leaderEn})`} /><Stat k="پایتخت" v={me.capitalFa} />
          <Stat k="جمعیت" v={`${fmt(me.population)} میلیون نفر`} /><Stat k="سواد" v={`${fmt(me.literacy, 0)}٪`} />
          <Stat k="بیکاری" v={`${fmt(me.unemployment)}٪`} /><Stat k="تورم" v={`${fmt(me.inflation)}٪`} />
          <p className="text-sm mt-2">مشروعیت</p><Bar v={me.legitimacy} /><p className="text-sm mt-2">ثبات</p><Bar v={me.stability} color="#2e9e6b" />
          <h3 className="font-bold mt-4 mb-1">گروه‌های جمعیتی</h3>
          {me.pops.map(p => <div key={p.cls} className="py-1 border-b border-line last:border-0"><div className="flex justify-between text-sm"><span>{p.cls} ({fmt(p.share * 100, 0)}٪)</span><span>سطح زندگی {fmt(p.sol, 0)} • رادیکال {fmt(p.radical, 0)}</span></div><Bar v={p.sol} /></div>)}
          <h3 className="font-bold mt-4 mb-1">روند تولید ناخالص و جمعیت</h3>
          <div style={{ height: 180 }} dir="ltr"><ResponsiveContainer><LineChart data={w.history}><XAxis dataKey="date" tick={{ fill: '#9fb0cc', fontSize: 10 }} /><YAxis tick={{ fill: '#9fb0cc', fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="gdp" stroke="#c9a227" dot={false} name="GDP" /><Line type="monotone" dataKey="pop" stroke="#2e9e6b" dot={false} name="Population" /></LineChart></ResponsiveContainer></div>
          <div className="flex gap-2 flex-wrap mt-3">
            <select value={g.calendar} onChange={e => g.setCalendar(e.target.value as 'gregorian' | 'persian')} aria-label="تقویم نمایش"><option value="gregorian">تقویم میلادی</option><option value="persian">تقویم هجری شمسی</option></select>
            <label className="chip"><input type="checkbox" checked={g.autoPause} onChange={e => g.setAutoPause(e.target.checked)} /> توقف خودکار هنگام رویداد مهم</label>
          </div>
          <h3 className="font-bold mt-4 mb-1">تنظیمات نمایش و عملکرد</h3>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm">عملکرد نقشه:</span>
            {([['low', 'پایین'], ['med', 'متوسط'], ['high', 'بالا']] as const).map(([id, label]) => (
              <button key={id} className={`btn ${g.perf === id ? 'btn-gold' : ''}`} onClick={() => g.setPerf(id)}>{label}</button>
            ))}
            <span className="text-sm">تم:</span>
            <button className={`btn ${g.theme === 'dark' ? 'btn-gold' : ''}`} onClick={() => g.setTheme('dark')}>تیره</button>
            <button className={`btn ${g.theme === 'light' ? 'btn-gold' : ''}`} onClick={() => g.setTheme('light')}>روشن</button>
          </div>
          <p className="text-xs text-mute mt-1">عملکرد پایین برچسب نام کشورها را خاموش می‌کند تا روی گوشی‌های ضعیف‌تر روان‌تر باشد.</p>
          <h3 className="font-bold mt-4 mb-1">ذخیره و بارگذاری (IndexedDB)</h3>
          <div className="flex gap-2 flex-wrap"><input type="text" value={saveName} onChange={e => setSaveName(e.target.value)} aria-label="نام کمپین" />
            <button className="btn btn-gold" onClick={async () => { await g.save('slot-' + Date.now(), saveName); setSaves(await listSaves()); }}><Save size={18} className="inline" /> ذخیره</button>
            <button className="btn" onClick={() => exportSave(w)}><Download size={18} className="inline" /> خروجی JSON</button></div>
          {saves.map(s => <div key={s.slot} className="flex items-center gap-2 py-2 border-b border-line last:border-0"><span className="flex-1 text-sm"><b>{s.name}</b> — {s.country} • {s.date}</span><button className="btn" onClick={() => g.load(s.slot)}>بارگذاری</button><button className="btn" aria-label="حذف" onClick={async () => { await deleteSave(s.slot); setSaves(await listSaves()); }}><Trash2 size={18} /></button></div>)}
          <button className="btn mt-3" onClick={() => location.reload()}>بازی تازه (انتخاب کشور)</button>
        </section>}

        {g.tab === 'economy' && <section className="card">
          <h2 className="text-xl font-black mb-2">اقتصاد {me.nameFa}</h2>
          <Stat k="تولید ناخالص داخلی" v={`${fmt(me.gdp, 0)} میلیارد دلار`} /><Stat k="خزانه" v={`${fmt(me.treasury)} میلیارد دلار`} />
          <Stat k="بدهی دولت" v={`${fmt(me.debt)} میلیارد دلار`} /><Stat k="تورم" v={`${fmt(me.inflation)}٪`} /><Stat k="بیکاری" v={`${fmt(me.unemployment)}٪`} />
          <h3 className="font-bold mt-3 mb-1">بخش‌های تولیدی (قیمت از عرضه و تقاضا)</h3>
          {me.sectors.map(s => <div key={s.key} className="flex justify-between gap-2 py-1 border-b border-line last:border-0 text-sm"><span>{s.name}</span><span>تولید {fmt(s.output, 0)} / ظرفیت {fmt(s.capacity, 0)} • قیمت {fmt(s.price, 0)}</span></div>)}
          <h3 className="font-bold mt-3 mb-1">سیاست مالی</h3>
          <Slider label="نرخ مالیات (٪)" value={me.policies.tax} max={60} onChange={v => g.setPolicy('tax', v)} />
          <Slider label="آزادی تجارت" value={me.policies.trade} onChange={v => g.setPolicy('trade', v)} />
          <Slider label="رفاه اجتماعی" value={me.policies.welfare} onChange={v => g.setPolicy('welfare', v)} />
          <h3 className="font-bold mt-3 mb-1">ساخت‌وساز (هزینه از خزانه، زمان‌بر)</h3>
          <div className="grid grid-cols-2 gap-2">{CONSTRUCTION_KINDS.map(k => <button key={k.kind} className="btn" onClick={() => g.build(k.kind)}>{k.name} ({fmt(k.months, 0)} ماه)</button>)}</div>
          {me.construction.length > 0 && <div className="mt-2">{me.construction.map(c => <p key={c.id} className="text-sm py-1">🏗 {c.name} — {fmt(c.monthsLeft, 0)} ماه مانده</p>)}</div>}
        </section>}

        {g.tab === 'politics' && <section className="card">
          <h2 className="text-xl font-black mb-2">سیاست و جامعه</h2>
          <Stat k="نظام حکومت" v={me.gov} /><Stat k="ایدئولوژی حاکم" v={me.ideology} />
          <p className="text-sm mt-1">مشروعیت {fmt(me.legitimacy, 0)}</p><Bar v={me.legitimacy} />
          <p className="text-sm mt-2">ثبات {fmt(me.stability, 0)}</p><Bar v={me.stability} color="#2e9e6b" />
          <p className="text-sm text-mute mt-2">ثبات پایین و رادیکال‌شدن گروه‌ها خطر کودتا و انقلاب را بالا می‌برد. آموزش و سلامت سواد و سطح زندگی را بالا می‌برد.</p>
          <Slider label="حقوق کار" value={me.policies.labor} onChange={v => g.setPolicy('labor', v)} />
          <Slider label="آموزش" value={me.policies.education} onChange={v => g.setPolicy('education', v)} />
          <Slider label="بهداشت و درمان" value={me.policies.health} onChange={v => g.setPolicy('health', v)} />
          <Slider label="بودجه نظامی" value={me.policies.military} onChange={v => g.setPolicy('military', v)} />
          <h3 className="font-bold mt-3 mb-1">گروه‌های ذی‌نفع</h3>
          {me.pops.map(p => <div key={p.cls} className="flex justify-between text-sm py-1 border-b border-line last:border-0"><span>{p.cls}</span><span>رضایت {fmt(p.sol, 0)} • رادیکال {fmt(p.radical, 0)}</span></div>)}
        </section>}

        {g.tab === 'diplomacy' && <section className="card">
          <h2 className="text-xl font-black mb-2">دیپلماسی</h2>
          {Object.values(w.countries).filter(c => c.id !== me.id).sort((a, b) => (me.relations[b.id] ?? 0) - (me.relations[a.id] ?? 0)).map(c => (
            <div key={c.id} className="flex items-center gap-2 py-2 border-b border-line last:border-0">
              <span className="w-3 h-3 rounded shrink-0" style={{ background: c.color }} />
              <span className="flex-1 text-sm"><b>{c.nameFa}</b> • روابط {fmt(me.relations[c.id] ?? 0, 0)}{me.allies.includes(c.id) ? ' • متحد' : ''}{me.sanctions.includes(c.id) ? ' • تحریم‌شده' : ''}{c.war ? ' • در جنگ' : ''}</span>
              <button className="btn" onClick={() => g.select(c.id)}>مشاهده</button>
              <button className="btn" onClick={() => g.ally(c.id)}>ائتلاف</button>
              <button className="btn" onClick={() => g.sanction(c.id)}>تحریم</button>
            </div>
          ))}
        </section>}

        {g.tab === 'military' && <section className="card">
          <h2 className="text-xl font-black mb-2">ارتش و جنگ</h2>
          <Stat k="قدرت نظامی کل" v={fmt(militaryPower(me), 0)} /><Stat k="نیروی زمینی" v={fmt(me.military.army, 0)} />
          <Stat k="نیروی دریایی" v={fmt(me.military.navy, 0)} /><Stat k="نیروی هوایی" v={fmt(me.military.air, 0)} />
          <Stat k="آمادگی" v={`${fmt(me.military.readiness, 0)}٪`} /><Stat k="لجستیک" v={`${fmt(me.military.logistics, 0)}٪`} /><Stat k="روحیه" v={`${fmt(me.military.morale, 0)}٪`} />
          {me.war ? <div className="mt-3">
            <p className="font-bold">جنگ با {w.countries[me.war.enemy]?.nameFa} — بهانه: {me.war.justification}</p>
            <p className="text-sm">پیشروی جبهه: {fmt(me.war.front, 0)} (مثبت یعنی پیشروی شما) • فرسودگی جنگ: {fmt(me.war.exhaustion, 0)}٪ • تلفات: {fmt(me.war.casualties, 0)} هزار نفر • {fmt(me.war.months, 0)} ماه</p>
            <Bar v={(me.war.front + 100) / 2} color="#e74c3c" />
            <button className="btn btn-gold mt-3" onClick={() => g.peace()}>مذاکره صلح و پایان جنگ</button>
          </div> : <div className="mt-3"><p className="text-sm text-mute mb-2">در حال حاضر در جنگ نیستید. اعلان جنگ نیازمند بهانه و قدرت کافی است؛ نتیجه به قدرت، لجستیک، روحیه و فناوری بستگی دارد.</p>
            <div className="flex gap-2 flex-wrap">{Object.values(w.countries).filter(c => c.id !== me.id && !c.war).slice(0, 8).map(c => <button key={c.id} className="btn" onClick={() => g.war(c.id)}>جنگ با {c.nameFa}</button>)}</div></div>}
        </section>}

        {g.tab === 'tech' && <section className="card">
          <h2 className="text-xl font-black mb-2">فناوری و پژوهش</h2>
          <p className="text-sm text-mute">امتیاز پژوهش از سواد و بودجه آموزش می‌آید. پژوهش جاری: {me.research ? `${TECHS.find(t => t.id === me.research!.techId)?.nameFa} (${fmt(me.research.progress, 0)})` : 'ندارد'}</p>
          <div className="space-y-2 mt-2">{TECHS.map(t => {
            const done = me.techs.includes(t.id); const locked = !t.prereq.every(p => me.techs.includes(p));
            return <div key={t.id} className="flex items-center gap-2 py-2 border-b border-line last:border-0">
              <span className="flex-1 text-sm"><b>{t.nameFa}</b> <span className="text-mute">({t.era})</span><br /><span className="text-mute">{t.desc} — {t.bonus}</span></span>
              {done ? <span className="chip">محقق‌شده ✓</span> : <button className="btn" disabled={locked || !!me.research} onClick={() => g.research(t.id)}>{locked ? 'قفل (پیش‌نیاز)' : `پژوهش (${fmt(t.cost, 0)})`}</button>}
            </div>;
          })}</div>
        </section>}

        {g.tab === 'reports' && <section className="card">
          <h2 className="text-xl font-black mb-2">گزارش‌ها و اخبار جهان</h2>
          <div className="flex gap-2 flex-wrap mb-3">{cats.map(c => <button key={c} className={`btn ${newsCat === c ? 'btn-gold' : ''}`} onClick={() => setNewsCat(c)}>{c}</button>)}</div>
          {news.length === 0 ? <p className="text-sm text-mute">خبری نیست.</p> : news.map(n => (
            <article key={n.id} className={`py-2 border-b border-line last:border-0 ${n.important ? 'bg-panel2 rounded-lg px-2' : ''}`}>
              <p className="text-sm"><span className="chip">{n.cat}</span> <span className="text-mute">{n.date}</span></p>
              <h3 className="font-bold mt-1">{n.title}</h3><p className="text-sm leading-7">{n.body}</p>
            </article>
          ))}
        </section>}
      </main>

      {ev && <div className="fixed inset-0 z-40 bg-black/70 flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={ev.titleFa}>
        <div className="card max-w-lg w-full max-h-[85vh] overflow-auto scroll-thin">
          <p className="chip">{ev.kind === 'تاریخی' ? 'رویداد تاریخی' : 'تاریخ جایگزین'} • {dateLabel(w.year, w.month, g.calendar)}</p>
          <h2 className="text-2xl font-black mt-2">{ev.titleFa}</h2>
          <p className="leading-8 mt-2">{ev.bodyFa}</p>
          <div className="space-y-2 mt-4">{ev.choices.map((ch, i) => <button key={i} className="btn btn-gold w-full text-start" onClick={() => g.chooseEvent(i)}>{ch.label}</button>)}</div>
        </div>
      </div>}

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-panel border-t border-line safe-b" aria-label="ناوبری اصلی">
        <div className="max-w-5xl mx-auto grid grid-cols-8">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => g.setTab(id)} className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${g.tab === id ? 'text-gold2 nav-active' : 'text-mute'}`} style={{ minHeight: 56 }} aria-current={g.tab === id}>
              <Icon size={20} />{label}
              {id === 'reports' && w.pendingEvent && <span className="nav-badge" aria-label="رویداد مهم">!</span>}
              {id === 'military' && me.war && <span className="nav-badge" aria-label="جنگ جاری">⚔</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
