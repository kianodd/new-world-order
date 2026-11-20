import type { Country, Sector, PopGroup } from './types';

// داده‌های تاریخی ژانویه ۱۹۴۶ — جمعیت و GDP «برآورد» تاریخی‌اند (منابع: Maddison Project، آمار سازمان ملل) و با برچسب اطمینان مشخص شده‌اند.
// نقشه از مرزهای واقعی Natural Earth در src/map/geo.ts استفاده می‌کند (تقریبی مدرن)؛ فیلد polygon قدیمی فقط برای سازگاری ذخیره‌ها مانده است.

export interface TechDef { id: string; nameFa: string; era: string; cost: number; prereq: string[]; desc: string; bonus: string }
export const TECHS: TechDef[] = [
  { id: 'nuclear', nameFa: 'فناوری هسته‌ای', era: 'دهه ۱۹۴۰', cost: 300, prereq: [], desc: 'انرژی و بازدارندگی هسته‌ای', bonus: 'قدرت نظامی +۱۵٪' },
  { id: 'computing', nameFa: 'رایانش اولیه', era: 'دهه ۱۹۴۰', cost: 180, prereq: [], desc: 'ماشین‌های محاسباتی', bonus: 'بهره‌وری +۵٪' },
  { id: 'jet', nameFa: 'موتور جت', era: 'دهه ۱۹۴۰', cost: 160, prereq: [], desc: 'هواپیماهای جت', bonus: 'نیروی هوایی +۲۰٪' },
  { id: 'industry', nameFa: 'روش‌های صنعتی مدرن', era: 'دهه ۱۹۴۰', cost: 120, prereq: [], desc: 'خط تولید و استانداردسازی', bonus: 'تولید صنعتی +۱۰٪' },
  { id: 'nuclearpower', nameFa: 'برق هسته‌ای', era: 'دهه ۱۹۵۰', cost: 260, prereq: ['nuclear'], desc: 'نیروگاه هسته‌ای', bonus: 'انرژی +۲۵٪' },
  { id: 'space', nameFa: 'فناوری فضایی', era: 'دهه ۱۹۵۰', cost: 280, prereq: ['jet'], desc: 'موشک و ماهواره', bonus: 'پرستیژ و نظامی +۱۰٪' },
  { id: 'electronics', nameFa: 'الکترونیک مدرن', era: 'دهه ۱۹۵۰', cost: 200, prereq: ['computing'], desc: 'ترانزیستور و مدار', bonus: 'بهره‌وری +۸٪' },
  { id: 'satellite', nameFa: 'ماهواره‌ها', era: 'دهه ۱۹۶۰', cost: 240, prereq: ['space'], desc: 'ارتباطات و شناسایی ماهواره‌ای', bonus: 'دیپلماسی و نظامی +۸٪' },
  { id: 'micro', nameFa: 'میکروالکترونیک', era: 'دهه ۱۹۶۰', cost: 260, prereq: ['electronics'], desc: 'مدار مجتمع', bonus: 'بهره‌وری +۱۰٪' },
  { id: 'telecom', nameFa: 'مخابرات مدرن', era: 'دهه ۱۹۶۰', cost: 180, prereq: ['electronics'], desc: 'شبکه‌های ارتباطی', bonus: 'خدمات +۱۰٪' },
  { id: 'microproc', nameFa: 'ریزپردازنده', era: 'دهه ۱۹۷۰', cost: 300, prereq: ['micro'], desc: 'قلب رایانه شخصی', bonus: 'بهره‌وری +۱۲٪' },
  { id: 'automation', nameFa: 'خودکارسازی صنعتی', era: 'دهه ۱۹۷۰', cost: 260, prereq: ['industry', 'micro'], desc: 'ربات و کنترل عددی', bonus: 'تولید +۱۵٪' },
  { id: 'pc', nameFa: 'رایانه شخصی', era: 'دهه ۱۹۸۰', cost: 280, prereq: ['microproc'], desc: 'رایانش خانگی و اداری', bonus: 'خدمات +۱۵٪' },
  { id: 'biotech', nameFa: 'زیست‌فناوری', era: 'دهه ۱۹۸۰', cost: 300, prereq: ['micro'], desc: 'دارو و کشاورزی نوین', bonus: 'سلامت و غذا +۱۰٪' },
  { id: 'internet', nameFa: 'اینترنت', era: 'دهه ۱۹۹۰', cost: 340, prereq: ['pc', 'telecom'], desc: 'شبکه جهانی', bonus: 'بهره‌وری +۱۸٪' },
  { id: 'digital', nameFa: 'ارتباطات دیجیتال', era: 'دهه ۱۹۹۰', cost: 260, prereq: ['internet'], desc: 'موبایل و داده', bonus: 'خدمات +۱۲٪' },
  { id: 'smartphone', nameFa: 'تلفن هوشمند', era: 'دهه ۲۰۰۰', cost: 300, prereq: ['digital'], desc: 'رایانش همراه', bonus: 'بهره‌وری +۱۰٪' },
  { id: 'renewable', nameFa: 'انرژی تجدیدپذیر', era: 'دهه ۲۰۰۰', cost: 280, prereq: ['automation'], desc: 'خورشیدی و بادی', bonus: 'انرژی +۲۰٪' },
  { id: 'ai', nameFa: 'هوش مصنوعی', era: 'دهه ۲۰۱۰ به بعد', cost: 400, prereq: ['internet', 'microproc'], desc: 'یادگیری ماشین', bonus: 'بهره‌وری +۲۵٪' },
  { id: 'robotics', nameFa: 'رباتیک پیشرفته', era: 'دهه ۲۰۱۰ به بعد', cost: 360, prereq: ['automation', 'ai'], desc: 'خودکارسازی کامل', bonus: 'تولید +۲۰٪' },
];

const S = (key: string, name: string, capacity: number, employed: number, tech: number): Sector => ({ key, name, capacity, output: capacity * 0.8, price: 100, employed, tech });
const P = (cls: string, share: number, literacy: number, sol: number): PopGroup => ({ cls, share, literacy, sol, radical: 10 });

function baseSectors(pop: number, ind: number, oil: number): Sector[] {
  return [
    S('agri', 'کشاورزی', pop * 0.9, pop * 0.35, 2),
    S('oil', 'نفت و گاز', oil, pop * 0.02, 3),
    S('steel', 'فولاد و معدن', ind * 0.6, pop * 0.04, 3),
    S('textile', 'نساجی', ind * 0.5, pop * 0.05, 2),
    S('mach', 'ماشین‌سازی', ind * 0.7, pop * 0.04, 3),
    S('energy', 'انرژی', ind * 0.5, pop * 0.02, 3),
    S('services', 'خدمات و مالی', pop * 0.8, pop * 0.15, 2),
  ];
}
function basePops(lit: number): PopGroup[] {
  return [P('کشاورز و دهقان', 0.55, Math.max(5, lit - 15), 35), P('کارگر صنعتی', 0.18, lit, 45), P('طبقه متوسط و متخصص', 0.14, Math.min(95, lit + 25), 65), P('سرمایه‌دار و مالک', 0.04, Math.min(98, lit + 35), 90), P('بوروکرات', 0.04, Math.min(95, lit + 20), 60), P('نظامی', 0.03, lit, 50), P('روحانی', 0.02, Math.min(90, lit + 10), 55)];
}

type Raw = [string, string, string, string, Country['gov'], string, string, Country['ideology'], number, number, number, number, number, number, number, number, string, [number, number][]];
// id, fa, en, capital, gov, leaderFa, leaderEn, ideology, pop(M), gdp(B$), lit, ind, oil, army, navy, air, color, polygon
const RAW: Raw[] = [
  ['IRN', 'ایران', 'Iran', 'تهران', 'پادشاهی مشروطه', 'محمدرضا پهلوی', 'Mohammad Reza Pahlavi', 'سلطنت‌طلب', 15, 10, 18, 8, 30, 12, 2, 3, '#2e9e6b', [[600, 150], [650, 140], [665, 175], [645, 205], [610, 200], [595, 175]]],
  ['USA', 'ایالات متحده آمریکا', 'United States', 'واشینگتن', 'جمهوری ریاستی', 'هری ترومن', 'Harry S. Truman', 'دموکراتیک', 141, 228, 97, 120, 40, 90, 80, 85, '#3b6fd4', [[60, 120], [230, 105], [250, 160], [200, 210], [90, 205], [55, 165]]],
  ['SUN', 'اتحاد جماهیر شوروی', 'Soviet Union', 'مسکو', 'دولت کمونیستی', 'یوسف استالین', 'Joseph Stalin', 'کمونیستی', 170, 110, 80, 80, 35, 110, 40, 70, '#c0392b', [[520, 55], [830, 45], [900, 110], [820, 160], [640, 150], [540, 120]]],
  ['GBR', 'بریتانیا', 'United Kingdom', 'لندن', 'پادشاهی مشروطه', 'کلمنت اتلی', 'Clement Attlee', 'دموکراتیک', 49, 60, 99, 45, 3, 35, 55, 40, '#7d5ba6', [[470, 95], [495, 90], [500, 125], [475, 130]]],
  ['FRA', 'فرانسه', 'France', 'پاریس', 'جمهوری پارلمانی', 'شارل دو گل', 'Charles de Gaulle', 'دموکراتیک', 40, 45, 96, 35, 2, 30, 25, 25, '#4a7fc1', [[470, 135], [510, 130], [515, 165], [480, 170], [465, 155]]],
  ['CHN', 'چین (جمهوری)', 'Republic of China', 'نانجینگ', 'جمهوری ریاستی', 'چیانگ کای‌شک', 'Chiang Kai-shek', 'ملی‌گرا', 450, 90, 20, 25, 5, 70, 8, 15, '#d4a017', [[760, 150], [860, 150], [875, 220], [800, 260], [745, 210]]],
  ['IND', 'هند بریتانیا', 'British India', 'دهلی نو', 'تحت اشغال', 'لرد ویول (نایب‌السلطنه)', 'Lord Wavell', 'دموکراتیک', 390, 65, 18, 20, 3, 40, 10, 12, '#e07b39', [[680, 210], [745, 215], [740, 290], [700, 320], [675, 260]]],
  ['TUR', 'ترکیه', 'Turkey', 'آنکارا', 'جمهوری ریاستی', 'عصمت اینونو', 'İsmet İnönü', 'ملی‌گرا', 19, 12, 30, 10, 1, 20, 6, 8, '#c0392b', [[545, 160], [600, 158], [600, 180], [550, 182]]],
  ['EGY', 'مصر', 'Egypt', 'قاهره', 'پادشاهی مشروطه', 'ملک فاروق', 'King Farouk', 'سلطنت‌طلب', 19, 8, 25, 6, 4, 12, 3, 4, '#c9a227', [[545, 200], [590, 200], [590, 245], [550, 245]]],
  ['SAU', 'عربستان سعودی', 'Saudi Arabia', 'ریاض', 'پادشاهی مطلقه', 'ملک عبدالعزیز آل سعود', 'Ibn Saud', 'مذهبی', 3, 2, 10, 1, 12, 4, 1, 1, '#1f7a4d', [[590, 205], [650, 210], [645, 250], [595, 245]]],
  ['JPN', 'ژاپن (تحت اشغال)', 'Japan', 'توکیو', 'تحت اشغال', 'شیگه‌رو یوشیدا', 'Shigeru Yoshida', 'دموکراتیک', 72, 30, 90, 30, 1, 2, 2, 2, '#b03a5b', [[885, 150], [905, 140], [910, 185], [890, 190]]],
  ['DEU', 'آلمان (تحت اشغال)', 'Germany', 'برلین', 'تحت اشغال', 'شورای کنترل متفقین', 'Allied Control Council', 'دموکراتیک', 66, 35, 95, 35, 2, 2, 2, 2, '#5d6d7e', [[505, 115], [545, 112], [548, 145], [510, 148]]],
  ['ITA', 'ایتالیا', 'Italy', 'رم', 'پادشاهی مشروطه', 'آلچیده د گاسپری', 'Alcide De Gasperi', 'دموکراتیک', 45, 28, 85, 25, 1, 12, 10, 8, '#2e8b57', [[505, 160], [530, 158], [535, 195], [515, 198]]],
  ['ESP', 'اسپانیا', 'Spain', 'مادرید', 'دیکتاتوری نظامی', 'فرانسیسکو فرانکو', 'Francisco Franco', 'فاشیستی', 26, 14, 80, 12, 1, 14, 8, 6, '#a67c00', [[455, 165], [490, 162], [492, 190], [460, 192]]],
  ['BRA', 'برزیل', 'Brazil', 'ریودوژانیرو', 'جمهوری فدرال', 'گاسپار دوترا', 'Eurico Gaspar Dutra', 'دموکراتیک', 46, 18, 45, 12, 3, 10, 8, 6, '#1f9d55', [[300, 300], [370, 290], [380, 360], [320, 390], [295, 340]]],
  ['MEX', 'مکزیک', 'Mexico', 'مکزیکوسیتی', 'جمهوری فدرال', 'مانوئل آویلا کاماچو', 'Manuel Ávila Camacho', 'ملی‌گرا', 22, 10, 50, 8, 8, 8, 3, 3, '#178a4c', [[120, 210], [190, 208], [195, 250], [130, 252]]],
  ['ARG', 'آرژانتین', 'Argentina', 'بوئنوس آیرس', 'جمهوری ریاستی', 'خوان پرون', 'Juan Perón', 'ملی‌گرا', 16, 12, 85, 10, 4, 9, 6, 5, '#5b9bd5', [[300, 400], [340, 395], [335, 460], [305, 450]]],
  ['CAN', 'کانادا', 'Canada', 'اتاوا', 'پادشاهی مشروطه', 'ویلیام مکنزی کینگ', 'William Lyon Mackenzie King', 'دموکراتیک', 12, 18, 98, 18, 6, 10, 8, 10, '#c0392b', [[70, 60], [240, 50], [250, 105], [80, 115]]],
  ['AUS', 'استرالیا', 'Australia', 'کانبرا', 'پادشاهی مشروطه', 'بن چیفلی', 'Ben Chifley', 'دموکراتیک', 7.5, 10, 98, 10, 1, 8, 7, 7, '#d4a017', [[790, 330], [890, 325], [895, 400], [800, 405]]],
  ['IDN', 'هند شرقی هلند', 'Dutch East Indies', 'باتاویا', 'تحت اشغال', 'سوکارنو (اعلام استقلال ۱۹۴۵)', 'Sukarno', 'ملی‌گرا', 70, 8, 12, 5, 8, 8, 3, 2, '#b03a3a', [[745, 300], [830, 300], [835, 325], [750, 328]]],
  ['KOR', 'کره (تحت اشغال)', 'Korea', 'سئول', 'تحت اشغال', 'اداره نظامی آمریکا', 'US Military Government', 'دموکراتیک', 26, 5, 35, 4, 0.5, 6, 2, 2, '#4a7fc1', [[855, 165], [880, 163], [880, 195], [858, 195]]],
  ['IRQ', 'عراق', 'Iraq', 'بغداد', 'پادشاهی مشروطه', 'ملک فیصل دوم', 'Faisal II', 'سلطنت‌طلب', 4.5, 2, 20, 2, 10, 5, 1, 2, '#7a6a2f', [[600, 180], [630, 178], [628, 205], [602, 203]]],
  ['AFG', 'افغانستان', 'Afghanistan', 'کابل', 'پادشاهی مطلقه', 'محمد ظاهر شاه', 'Mohammed Zahir Shah', 'سلطنت‌طلب', 11, 1.5, 8, 1, 0.5, 6, 0, 1, '#3a7d44', [[650, 165], [685, 162], [683, 192], [652, 190]]],
  ['ETH', 'اتیوپی', 'Ethiopia', 'آدیس آبابا', 'پادشاهی مطلقه', 'هایله سلاسی', 'Haile Selassie', 'سلطنت‌طلب', 16, 1.5, 5, 1, 0.2, 7, 0, 1, '#8a7d2f', [[560, 270], [600, 268], [598, 305], [563, 302]]],
  ['ZAF', 'آفریقای جنوبی', 'South Africa', 'پرتوریا', 'پادشاهی مشروطه', 'یان اسموتس', 'Jan Smuts', 'دموکراتیک', 11, 5, 55, 6, 1, 7, 4, 5, '#2f6f4f', [[520, 360], [575, 358], [572, 405], [525, 402]]],
  ['POL', 'لهستان', 'Poland', 'ورشو', 'دولت تک‌حزبی', 'بولسواف بیروت', 'Bolesław Bierut', 'کمونیستی', 24, 10, 80, 10, 2, 15, 4, 6, '#a63d3d', [[540, 105], [575, 102], [578, 135], [543, 137]]],
  ['YUG', 'یوگسلاوی', 'Yugoslavia', 'بلگراد', 'دولت کمونیستی', 'یوسیپ بروز تیتو', 'Josip Broz Tito', 'کمونیستی', 15, 6, 60, 6, 1, 12, 3, 5, '#3d6ea6', [[530, 150], [560, 148], [560, 175], [532, 175]]],
  ['GRC', 'یونان', 'Greece', 'آتن', 'پادشاهی مشروطه', 'تیمیستوکلیس سوفولیس', 'Themistoklis Sofoulis', 'دموکراتیک', 7, 3, 70, 3, 0.5, 7, 4, 3, '#5b8fd4', [[548, 178], [572, 176], [572, 200], [550, 200]]],
  ['NLD', 'هلند', 'Netherlands', 'آمستردام', 'پادشاهی مشروطه', 'ویلهلم شرمرهورن', 'Willem Schermerhorn', 'دموکراتیک', 9, 7, 98, 8, 1, 6, 6, 5, '#e07b39', [[492, 105], [512, 103], [513, 122], [494, 123]]],
  ['SWE', 'سوئد', 'Sweden', 'استکهلم', 'پادشاهی مشروطه', 'پر آلبین هانسون', 'Per Albin Hansson', 'دموکراتیک', 6.7, 6, 99, 7, 1, 6, 5, 6, '#d4a017', [[505, 60], [535, 58], [540, 100], [510, 102]]],
];

export function buildCountries(): Record<string, Country> {
  const out: Record<string, Country> = {};
  for (const [id, fa, en, cap, gov, lf, le, ideo, pop, gdp, lit, ind, oil, army, navy, air, color, poly] of RAW) {
    out[id] = {
      id, nameFa: fa, nameEn: en, capitalFa: cap, gov, leaderFa: lf, leaderEn: le, ideology: ideo,
      population: pop, gdp, treasury: Math.round(gdp * 0.15 * 10) / 10, debt: Math.round(gdp * 0.4 * 10) / 10, inflation: 8,
      literacy: lit, stability: gov === 'تحت اشغال' ? 40 : 62, legitimacy: gov === 'تحت اشغال' ? 30 : 60, unemployment: 9,
      military: { army, navy, air, readiness: 55, logistics: 50, morale: 60 },
      sectors: baseSectors(pop, ind, oil), pops: basePops(lit),
      policies: { tax: 20, labor: 40, education: 30, health: 25, trade: 50, military: 30, welfare: 25 },
      relations: {}, allies: [], sanctions: [], techs: ind > 20 ? ['industry'] : [], research: null, researchPoints: 0,
      construction: [], war: null, color, polygon: poly, confidence: 'برآورد', occupied: gov === 'تحت اشغال',
    };
  }
  // روابط اولیه جنگ سرد (برآورد تاریخی)
  const rel = (a: string, b: string, v: number) => { out[a].relations[b] = v; out[b].relations[a] = v; };
  rel('USA', 'SUN', -60); rel('USA', 'GBR', 70); rel('USA', 'FRA', 55); rel('SUN', 'POL', 60); rel('SUN', 'YUG', 40);
  rel('IRN', 'SUN', -30); rel('IRN', 'GBR', -10); rel('IRN', 'USA', 20); rel('IRN', 'TUR', 25); rel('IRN', 'IRQ', -5);
  rel('CHN', 'SUN', -20); rel('CHN', 'USA', 30); rel('EGY', 'GBR', -25); rel('IND', 'GBR', -20);
  out['USA'].allies = ['GBR', 'FRA', 'CAN']; out['GBR'].allies = ['USA', 'FRA', 'CAN', 'AUS'];
  out['FRA'].allies = ['USA', 'GBR']; out['CAN'].allies = ['USA', 'GBR']; out['AUS'].allies = ['GBR', 'USA'];
  return out;
}

export const CONSTRUCTION_KINDS = [
  { kind: 'factory', name: 'کارخانه صنعتی', sector: 'mach', months: 12, cost: 2, gain: 4 },
  { kind: 'mine', name: 'معدن و فولاد', sector: 'steel', months: 10, cost: 1.5, gain: 3 },
  { kind: 'farm', name: 'مزرعه مدرن', sector: 'agri', months: 8, cost: 0.8, gain: 3 },
  { kind: 'oilfield', name: 'میدان نفتی', sector: 'oil', months: 14, cost: 3, gain: 5 },
  { kind: 'power', name: 'نیروگاه', sector: 'energy', months: 12, cost: 2, gain: 4 },
  { kind: 'university', name: 'دانشگاه', sector: 'services', months: 16, cost: 1.2, gain: 2 },
  { kind: 'hospital', name: 'بیمارستان', sector: 'services', months: 10, cost: 1, gain: 2 },
  { kind: 'port', name: 'بندر و راه‌آهن', sector: 'services', months: 14, cost: 2.5, gain: 3 },
];
