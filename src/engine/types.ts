// هسته داده‌ای «نظم نوین جهان» — موتور مستقل از React
export type Ideology = 'دموکراتیک' | 'کمونیستی' | 'سلطنت‌طلب' | 'ملی‌گرا' | 'فاشیستی' | 'مذهبی' | 'نظامی';
export type GovType = 'پادشاهی مشروطه' | 'پادشاهی مطلقه' | 'جمهوری پارلمانی' | 'جمهوری ریاستی' | 'دولت تک‌حزبی' | 'دولت کمونیستی' | 'دیکتاتوری نظامی' | 'جمهوری فدرال' | 'حکومت دینی' | 'تحت اشغال';

export interface PopGroup {
  cls: string; // کشاورز، کارگر، طبقه متوسط، سرمایه‌دار، بوروکرات، نظامی، روحانی
  share: number; // سهم از جمعیت 0..1
  literacy: number; // 0..100
  sol: number; // سطح زندگی 0..100
  radical: number; // رادیکال‌شدن 0..100
}

export interface Sector {
  key: string; name: string;
  capacity: number; // ظرفیت تولید
  output: number;
  price: number; // شاخص قیمت
  employed: number; // میلیون نفر
  tech: number; // سطح فناوری 0..10
}

export interface ConstructionItem {
  id: string; kind: string; name: string; monthsLeft: number; totalMonths: number; cost: number; sector: string; gain: number;
}

export interface WarState {
  enemy: string; // id کشور دشمن
  front: number; // -100..100 مثبت یعنی پیشروی ما
  exhaustion: number; // 0..100
  casualties: number; // هزار نفر
  months: number;
  justification: string;
}

export interface Country {
  id: string; nameFa: string; nameEn: string; capitalFa: string;
  gov: GovType; leaderFa: string; leaderEn: string;
  ideology: Ideology;
  population: number; // میلیون نفر
  gdp: number; // میلیارد دلار (برآورد)
  treasury: number; debt: number; inflation: number; // درصد
  literacy: number; stability: number; legitimacy: number; // 0..100
  unemployment: number; // درصد
  military: { army: number; navy: number; air: number; readiness: number; logistics: number; morale: number };
  sectors: Sector[];
  pops: PopGroup[];
  policies: { tax: number; labor: number; education: number; health: number; trade: number; military: number; welfare: number };
  relations: Record<string, number>; // -100..100
  allies: string[]; sanctions: string[];
  techs: string[]; research: { techId: string; progress: number } | null;
  researchPoints: number;
  construction: ConstructionItem[];
  war: WarState | null;
  color: string;
  polygon: [number, number][]; // مختصات نقشه ساده‌شده 0..1000 x 0..520
  confidence: 'مستند' | 'برآورد';
  occupied?: boolean;
}

export interface NewsItem { id: string; date: string; cat: string; title: string; body: string; country?: string; important?: boolean }

export interface GameEvent {
  id: string; year: number; month: number; // ماه 1..12
  titleFa: string; bodyFa: string; countries: string[]; // 'ALL' یعنی همه
  kind: 'تاریخی' | 'جایگزین';
  choices: { label: string; apply: (c: Country, w: World) => string }[];
}

export interface World {
  version: number;
  year: number; month: number; // شروع 1946/1
  seed: number; rngState: number;
  countries: Record<string, Country>;
  playerId: string;
  news: NewsItem[];
  history: { date: string; gdp: number; pop: number; treasury: number }[];
  firedEvents: string[];
  pendingEvent: string | null;
  over: boolean;
}

export const VERSION = 1;
export const dateStr = (w: World) => `${w.year}-${String(w.month).padStart(2, '0')}`;
