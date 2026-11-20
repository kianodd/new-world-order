import type { GameEvent } from './types';
import { clamp } from './rng';

// رویدادهای تاریخی با انتخاب‌های واقعی — پیامدها در شبیه‌سازی اعمال می‌شوند.
// «تاریخی» یعنی ریشه در رخداد واقعی دارد؛ نتیجه بازی می‌تواند جایگزین شود.
export const EVENTS: GameEvent[] = [
  {
    id: 'iran-crisis-1946', year: 1946, month: 3, titleFa: 'بحران ایران ۱۹۴۶', kind: 'تاریخی', countries: ['IRN'],
    bodyFa: 'نیروهای شوروی پس از جنگ در شمال ایران مانده‌اند و جمهوری‌های خودخوانده در آذربایجان و کردستان اعلام شده‌اند. تهران زیر فشار هم‌زمان مسکو و لندن است.',
    choices: [
      { label: 'شکایت به شورای امنیت و مذاکره', apply: (c) => { c.stability = clamp(c.stability + 8, 0, 100); c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) - 10, -100, 100); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 10, -100, 100); return 'با حمایت آمریکا، شوروی به خروج متعهد شد و ثبات افزایش یافت.'; } },
      { label: 'امتیاز نفتی به شوروی', apply: (c) => { c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) + 25, -100, 100); c.legitimacy = clamp(c.legitimacy - 8, 0, 100); c.treasury += 0.5; return 'مسکو نرم‌تر شد اما مشروعیت داخلی آسیب دید.'; } },
      { label: 'بسیج نظامی در شمال', apply: (c) => { c.military.readiness = clamp(c.military.readiness + 10, 0, 100); c.treasury -= 0.8; c.stability = clamp(c.stability - 6, 0, 100); return 'تنش بالا رفت و هزینه نظامی خزانه را خالی کرد.'; } },
    ],
  },
  {
    id: 'cold-war-start', year: 1946, month: 3, titleFa: 'آغاز جنگ سرد', kind: 'تاریخی', countries: ['ALL'],
    bodyFa: 'سخنرانی چرچیل در فولتون از «پرده آهنین» گفت. دو ابرقدرت آمریکا و شوروی در برابر هم صف‌آرایی می‌کنند.',
    choices: [
      { label: 'نزدیکی به بلوک غرب', apply: (c) => { c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 15, -100, 100); c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) - 15, -100, 100); return 'روابط با غرب گرم‌تر شد.'; } },
      { label: 'نزدیکی به بلوک شرق', apply: (c) => { c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) + 15, -100, 100); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) - 15, -100, 100); return 'روابط با شرق گرم‌تر شد.'; } },
      { label: 'بی‌طرفی فعال', apply: (c) => { c.stability = clamp(c.stability + 3, 0, 100); return 'سیاست بی‌طرفی اعلام شد.'; } },
    ],
  },
  {
    id: 'marshall-1947', year: 1947, month: 6, titleFa: 'طرح مارشال', kind: 'تاریخی', countries: ['ALL'],
    bodyFa: 'آمریکا برنامه بازسازی اروپا را پیشنهاد کرد. پذیرش آن کمک مالی و نفوذ واشینگتن را به همراه دارد.',
    choices: [
      { label: 'پذیرش کمک و همکاری', apply: (c) => { c.treasury += Math.max(0.5, c.gdp * 0.05); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 20, -100, 100); return 'کمک مالی رسید و بازسازی شتاب گرفت.'; } },
      { label: 'رد پیشنهاد', apply: (c) => { c.relations['USA'] = clamp((c.relations['USA'] ?? 0) - 15, -100, 100); c.legitimacy = clamp(c.legitimacy + 4, 0, 100); return 'استقلال‌طلبی داخلی تقویت شد.'; } },
    ],
  },
  {
    id: 'india-partition-1947', year: 1947, month: 8, titleFa: 'استقلال و تقسیم هند', kind: 'تاریخی', countries: ['IND', 'GBR'],
    bodyFa: 'هند بریتانیا مستقل و به هند و پاکستان تقسیم می‌شود؛ موجی از مهاجرت و خشونت فرقه‌ای در راه است.',
    choices: [
      { label: 'مدیریت مسالمت‌آمیز انتقال', apply: (c) => { c.stability = clamp(c.stability + 5, 0, 100); c.legitimacy = clamp(c.legitimacy + 8, 0, 100); return 'انتقال قدرت با آرامش نسبی انجام شد.'; } },
      { label: 'سرکوب ناآرامی‌ها', apply: (c) => { c.stability = clamp(c.stability - 10, 0, 100); c.legitimacy = clamp(c.legitimacy - 10, 0, 100); return 'خشونت بالا گرفت و مشروعیت سقوط کرد.'; } },
    ],
  },
  {
    id: 'israel-1948', year: 1948, month: 5, titleFa: 'تأسیس اسرائیل و جنگ ۱۹۴۸', kind: 'تاریخی', countries: ['EGY', 'IRQ', 'SAU', 'TUR', 'IRN', 'GBR', 'USA'],
    bodyFa: 'دولت اسرائیل اعلام موجودیت کرد و ارتش‌های عرب وارد جنگ شدند. خاورمیانه وارد دوره‌ای تازه از منازعه می‌شود.',
    choices: [
      { label: 'حمایت دیپلماتیک از فلسطینی‌ها', apply: (c) => { c.relations['EGY'] = clamp((c.relations['EGY'] ?? 0) + 12, -100, 100); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) - 8, -100, 100); return 'موضع منطقه‌ای تقویت شد.'; } },
      { label: 'شناسایی و میانجی‌گری', apply: (c) => { c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 10, -100, 100); c.legitimacy = clamp(c.legitimacy - 4, 0, 100); return 'واشینگتن خشنود شد؛ افکار عمومی داخلی ناراضی است.'; } },
      { label: 'بی‌طرفی', apply: () => { return 'کشور از منازعه فاصله گرفت.'; } },
    ],
  },
  {
    id: 'nato-prc-1949', year: 1949, month: 10, titleFa: 'ناتو، چین کمونیست و بمب شوروی', kind: 'تاریخی', countries: ['ALL'],
    bodyFa: 'سال ۱۹۴۹ جهان را دگرگون کرد: پیمان ناتو امضا شد، جمهوری خلق چین اعلام موجودیت کرد و شوروی نخستین بمب اتمی خود را آزمایش کرد.',
    choices: [
      { label: 'پیوستن به ائتلاف غرب', apply: (c) => { if (!c.allies.includes('USA')) c.allies.push('USA'); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 25, -100, 100); c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) - 20, -100, 100); return 'عضویت در بلوک غرب ثبت شد.'; } },
      { label: 'هم‌پیمانی با شرق', apply: (c) => { if (!c.allies.includes('SUN')) c.allies.push('SUN'); c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) + 25, -100, 100); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) - 20, -100, 100); return 'عضویت در بلوک شرق ثبت شد.'; } },
      { label: 'عدم تعهد', apply: (c) => { c.stability = clamp(c.stability + 4, 0, 100); return 'مسیر عدم تعهد انتخاب شد.'; } },
    ],
  },
  {
    id: 'korea-1950', year: 1950, month: 6, titleFa: 'جنگ کره', kind: 'تاریخی', countries: ['KOR', 'USA', 'CHN', 'SUN', 'JPN'],
    bodyFa: 'کره شمالی به جنوب حمله کرد. جنگی نیابتی میان دو بلوک آغاز شده و سازمان ملل مداخله می‌کند.',
    choices: [
      { label: 'حمایت از مداخله سازمان ملل', apply: (c) => { c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 12, -100, 100); c.treasury -= 0.4; return 'حمایت بین‌المللی اعلام شد.'; } },
      { label: 'مخالفت با جنگ', apply: (c) => { c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) + 10, -100, 100); return 'موضع ضدجنگ ثبت شد.'; } },
    ],
  },
  {
    id: 'iran-coup-1953', year: 1953, month: 8, titleFa: 'کودتای ۲۸ مرداد ۱۹۵۳', kind: 'تاریخی', countries: ['IRN'],
    bodyFa: 'پس از ملی‌شدن نفت به رهبری محمد مصدق، بحران سیاسی و فشار خارجی به کودتا انجامید. آینده ایران در گرو تصمیم امروز است.',
    choices: [
      { label: 'حمایت از دولت مصدق و ملی‌شدن نفت', apply: (c) => { c.legitimacy = clamp(c.legitimacy + 12, 0, 100); c.relations['GBR'] = clamp((c.relations['GBR'] ?? 0) - 30, -100, 100); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) - 25, -100, 100); c.treasury += 1.2; return 'نفت ملی ماند؛ غرب خشمگین شد اما مردم پشت دولت ایستادند.'; } },
      { label: 'کنار آمدن با غرب و برکناری مصدق', apply: (c) => { c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 25, -100, 100); c.legitimacy = clamp(c.legitimacy - 15, 0, 100); c.stability = clamp(c.stability + 5, 0, 100); return 'دولت سقوط کرد؛ روابط با غرب ترمیم شد و زخم مشروعیت ماند.'; } },
    ],
  },
  {
    id: 'stalin-1953', year: 1953, month: 3, titleFa: 'مرگ استالین', kind: 'تاریخی', countries: ['SUN', 'USA', 'GBR', 'FRA', 'POL', 'YUG'],
    bodyFa: 'یوسف استالین درگذشت. نبرد جانشینی در کرملین و امکان ذوب یخ جنگ سرد پیش روست.',
    choices: [
      { label: 'استقبال از تنش‌زدایی', apply: (c) => { c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) + 12, -100, 100); return 'سیگنال آشتی فرستاده شد.'; } },
      { label: 'هوشیاری و تقویت ارتش', apply: (c) => { c.military.readiness = clamp(c.military.readiness + 8, 0, 100); c.treasury -= 0.5; return 'آماده‌باش نظامی افزایش یافت.'; } },
    ],
  },
  {
    id: 'suez-1956', year: 1956, month: 10, titleFa: 'بحران سوئز', kind: 'تاریخی', countries: ['EGY', 'GBR', 'FRA', 'USA', 'SUN'],
    bodyFa: 'مصر کانال سوئز را ملی کرد؛ بریتانیا، فرانسه و اسرائیل حمله کردند و بحران جهانی شد.',
    choices: [
      { label: 'حمایت از مصر', apply: (c) => { c.relations['EGY'] = clamp((c.relations['EGY'] ?? 0) + 18, -100, 100); c.relations['GBR'] = clamp((c.relations['GBR'] ?? 0) - 15, -100, 100); return 'همبستگی منطقه‌ای تقویت شد.'; } },
      { label: 'حمایت از مداخله غرب', apply: (c) => { c.relations['GBR'] = clamp((c.relations['GBR'] ?? 0) + 15, -100, 100); c.relations['EGY'] = clamp((c.relations['EGY'] ?? 0) - 18, -100, 100); return 'روابط با لندن گرم شد.'; } },
      { label: 'میانجی‌گری در سازمان ملل', apply: (c) => { c.legitimacy = clamp(c.legitimacy + 5, 0, 100); return 'نقش میانجی پرستیژ آورد.'; } },
    ],
  },
  {
    id: 'cuba-1962', year: 1962, month: 10, titleFa: 'بحران موشکی کوبا', kind: 'تاریخی', countries: ['USA', 'SUN'],
    bodyFa: 'موشک‌های شوروی در کوبا جهان را تا آستانه جنگ هسته‌ای برد. تصمیم‌های امروز سرنوشت بشریت را رقم می‌زند.',
    choices: [
      { label: 'دیپلماسی و توافق پشت پرده', apply: (c) => { c.stability = clamp(c.stability + 6, 0, 100); c.relations['SUN'] = clamp((c.relations['SUN'] ?? 0) + 10, -100, 100); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 10, -100, 100); return 'بحران با توافق فروکش کرد.'; } },
      { label: 'آماده‌باش کامل هسته‌ای', apply: (c) => { c.military.readiness = clamp(c.military.readiness + 15, 0, 100); c.stability = clamp(c.stability - 8, 0, 100); return 'جهان نفسش را حبس کرد؛ ارتش در آماده‌باش کامل است.'; } },
    ],
  },
  {
    id: 'iran-rev-1979', year: 1979, month: 2, titleFa: 'انقلاب ایران ۱۹۷۹', kind: 'تاریخی', countries: ['IRN', 'USA', 'SUN', 'IRQ', 'SAU'],
    bodyFa: 'موج اعتراضات سراسری رژیم پهلوی را سرنگون کرد. نظم تازه‌ای در ایران و خاورمیانه در حال شکل‌گیری است.',
    choices: [
      { label: 'حمایت از انقلاب و نظم تازه', apply: (c) => { c.legitimacy = clamp(c.legitimacy + 10, 0, 100); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) - 30, -100, 100); c.stability = clamp(c.stability - 8, 0, 100); return 'انقلاب پیروز شد؛ روابط با آمریکا گسست.'; } },
      { label: 'سرکوب و حفظ رژیم', apply: (c) => { c.stability = clamp(c.stability - 18, 0, 100); c.legitimacy = clamp(c.legitimacy - 20, 0, 100); c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 12, -100, 100); return 'سرکوب موقتاً رژیم را نگه داشت اما خشم انباشته شد.'; } },
    ],
  },
  {
    id: 'ussr-1991', year: 1991, month: 12, titleFa: 'فروپاشی شوروی', kind: 'تاریخی', countries: ['ALL'],
    bodyFa: 'اتحاد جماهیر شوروی منحل شد و جنگ سرد پایان یافت. جهان تک‌قطبی تازه‌ای آغاز می‌شود.',
    choices: [
      { label: 'نزدیکی به نظم تازه غرب', apply: (c) => { c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 18, -100, 100); c.treasury += Math.max(0.3, c.gdp * 0.03); return 'از نظم تازه سود بردید.'; } },
      { label: 'حفظ استقلال راهبردی', apply: (c) => { c.legitimacy = clamp(c.legitimacy + 6, 0, 100); return 'استقلال راهبردی حفظ شد.'; } },
    ],
  },
  {
    id: 'sep11-2001', year: 2001, month: 9, titleFa: 'حملات ۱۱ سپتامبر', kind: 'تاریخی', countries: ['ALL'],
    bodyFa: 'حملات تروریستی در آمریکا جهان را شوکه کرد؛ «جنگ علیه تروریسم» و مداخله در افغانستان آغاز شد.',
    choices: [
      { label: 'همکاری ضدتروریسم با واشینگتن', apply: (c) => { c.relations['USA'] = clamp((c.relations['USA'] ?? 0) + 18, -100, 100); c.military.readiness = clamp(c.military.readiness + 5, 0, 100); return 'همکاری امنیتی گسترش یافت.'; } },
      { label: 'مخالفت با مداخله نظامی', apply: (c) => { c.relations['USA'] = clamp((c.relations['USA'] ?? 0) - 12, -100, 100); c.legitimacy = clamp(c.legitimacy + 4, 0, 100); return 'موضع ضدجنگ ثبت شد.'; } },
    ],
  },
  {
    id: 'crisis-2008', year: 2008, month: 9, titleFa: 'بحران مالی جهانی ۲۰۰۸', kind: 'تاریخی', countries: ['ALL'],
    bodyFa: 'فروپاشی بازار مسکن آمریکا به بحران مالی جهانی انجامید؛ بانک‌ها و بورس‌ها سقوط کردند.',
    choices: [
      { label: 'بسته نجات و تحریک اقتصاد', apply: (c) => { c.treasury -= Math.max(0.5, c.gdp * 0.06); c.debt += Math.max(0.5, c.gdp * 0.08); c.stability = clamp(c.stability + 4, 0, 100); return 'اقتصاد با هزینه سنگین نجات یافت.'; } },
      { label: 'ریاضت اقتصادی', apply: (c) => { c.unemployment = clamp(c.unemployment + 4, 0, 60); c.stability = clamp(c.stability - 8, 0, 100); return 'ریاضت خشم اجتماعی آورد.'; } },
    ],
  },
  {
    id: 'covid-2020', year: 2020, month: 3, titleFa: 'همه‌گیری کووید-۱۹', kind: 'تاریخی', countries: ['ALL'],
    bodyFa: 'ویروس کرونا جهان را متوقف کرد؛ قرنطینه، رکود اقتصادی و بحران سلامت هم‌زمان رخ داد.',
    choices: [
      { label: 'قرنطینه و حمایت معیشتی', apply: (c) => { c.treasury -= Math.max(0.4, c.gdp * 0.05); c.stability = clamp(c.stability + 3, 0, 100); c.population = Math.max(0.1, c.population * 0.998); return 'سلامت حفظ شد؛ خزانه زیر فشار رفت.'; } },
      { label: 'اولویت اقتصاد و بازگشایی سریع', apply: (c) => { c.population = Math.max(0.1, c.population * 0.994); c.stability = clamp(c.stability - 7, 0, 100); return 'اقتصاد زودتر برگشت اما تلفات انسانی بالا بود.'; } },
    ],
  },
];
