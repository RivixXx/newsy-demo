import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const DEFAULT_AD_CONFIG = {
  enabled: true,
  badge: 'ПАРТНЁР В ТАМБОВЕ',
  title: 'iStore68',
  titleAccent: 'Ремонт Apple',
  subtitle: 'Оригинальные запчасти, гарантия 30 дней, фотоотчёт ремонта. от 15 минут.',
  discount: '-20%',
  discountLabel: 'на первый ремонт',
  promoCode: 'САЙТ',
  description: 'Ремонт iPhone, iPad, MacBook и Android устройств в Тамбове. Быстро, качественно, с гарантией.',
  ctaText: 'Перейти на сайт',
  ctaUrl: 'https://istore68.ru/',
  address: 'г. Тамбов, ул. Чичерина, 17',
  phone: '+7 (962) 230-40-40',
  workHours: 'Каждый день 10:00–19:00',
  services: ['iPhone', 'iPad', 'MacBook', 'Android'],
};

const CONFIG_PATH = join(process.cwd(), 'data', 'ad-config.json');

export async function readAdConfig() {
  try {
    if (existsSync(CONFIG_PATH)) {
      const raw = await readFile(CONFIG_PATH, 'utf-8');
      return { ...DEFAULT_AD_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_AD_CONFIG;
}

export async function writeAdConfig(config: Record<string, unknown>) {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
