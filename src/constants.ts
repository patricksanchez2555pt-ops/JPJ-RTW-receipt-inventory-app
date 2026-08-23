import type { Product, Size } from './types/localModels';

export const PRODUCTS: Product[] = [
  {
    id: 'jogging-pants',
    name: 'Jogging Pants',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'leotard-kids-long',
    name: 'Leotard Kids - Long Sleeves',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'leotard-kids-short',
    name: 'Leotard Kids - Short Sleeves',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cycling-shorts',
    name: 'Cycling Shorts',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'leotard-adult-long',
    name: 'Leotard Adult - Long Sleeves',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'leotard-adult-short',
    name: 'Leotard Adult - Short Sleeves',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tights-sakbet-kids',
    name: 'Tights / Sakbet - Kids',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tights-sakbet-adult',
    name: 'Tights / Sakbet - Adult',
    createdAt: new Date().toISOString(),
  },
];

export const SIZES: Size[] = [
  // ==========================================
  // JOGGING PANTS
  // ==========================================

  {
    id: 'jogging-pants-4',
    productId: 'jogging-pants',
    name: '4',
    price: 75,
  },
  {
    id: 'jogging-pants-6',
    productId: 'jogging-pants',
    name: '6',
    price: 80,
  },
  {
    id: 'jogging-pants-8',
    productId: 'jogging-pants',
    name: '8',
    price: 85,
  },
  {
    id: 'jogging-pants-10',
    productId: 'jogging-pants',
    name: '10',
    price: 90,
  },
  {
    id: 'jogging-pants-12',
    productId: 'jogging-pants',
    name: '12',
    price: 95,
  },
  {
    id: 'jogging-pants-14',
    productId: 'jogging-pants',
    name: '14',
    price: 100,
  },
  {
    id: 'jogging-pants-16',
    productId: 'jogging-pants',
    name: '16',
    price: 105,
  },
  {
    id: 'jogging-pants-18',
    productId: 'jogging-pants',
    name: '18',
    price: 110,
  },
  {
    id: 'jogging-pants-20',
    productId: 'jogging-pants',
    name: '20',
    price: 115,
  },
  {
    id: 'jogging-pants-s',
    productId: 'jogging-pants',
    name: 'S',
    price: 125,
  },
  {
    id: 'jogging-pants-m',
    productId: 'jogging-pants',
    name: 'M',
    price: 130,
  },
  {
    id: 'jogging-pants-l',
    productId: 'jogging-pants',
    name: 'L',
    price: 135,
  },
  {
    id: 'jogging-pants-xl',
    productId: 'jogging-pants',
    name: 'XL',
    price: 140,
  },
  {
    id: 'jogging-pants-2x',
    productId: 'jogging-pants',
    name: '2X',
    price: 150,
  },

  // ==========================================
  // LEOTARD KIDS - LONG SLEEVES
  // ==========================================

  {
    id: 'leotard-kids-long-s',
    productId: 'leotard-kids-long',
    name: 'S',
    price: 85,
  },
  {
    id: 'leotard-kids-long-m',
    productId: 'leotard-kids-long',
    name: 'M',
    price: 90,
  },
  {
    id: 'leotard-kids-long-l',
    productId: 'leotard-kids-long',
    name: 'L',
    price: 95,
  },
  {
    id: 'leotard-kids-long-xl',
    productId: 'leotard-kids-long',
    name: 'XL',
    price: 100,
  },
  {
    id: 'leotard-kids-long-2x',
    productId: 'leotard-kids-long',
    name: '2X',
    price: 105,
  },
  {
    id: 'leotard-kids-long-a',
    productId: 'leotard-kids-long',
    name: 'A',
    price: 115,
  },

  // ==========================================
  // LEOTARD KIDS - SHORT SLEEVES
  // ==========================================

  {
    id: 'leotard-kids-short-s',
    productId: 'leotard-kids-short',
    name: 'S',
    price: 75,
  },
  {
    id: 'leotard-kids-short-m',
    productId: 'leotard-kids-short',
    name: 'M',
    price: 80,
  },
  {
    id: 'leotard-kids-short-l',
    productId: 'leotard-kids-short',
    name: 'L',
    price: 85,
  },
  {
    id: 'leotard-kids-short-xl',
    productId: 'leotard-kids-short',
    name: 'XL',
    price: 90,
  },
  {
    id: 'leotard-kids-short-2x',
    productId: 'leotard-kids-short',
    name: '2X',
    price: 95,
  },
  {
    id: 'leotard-kids-short-a',
    productId: 'leotard-kids-short',
    name: 'A',
    price: 105,
  },

  // ==========================================
  // CYCLING SHORTS
  // ==========================================

  {
    id: 'cycling-shorts-s',
    productId: 'cycling-shorts',
    name: 'S',
    price: 40,
  },
  {
    id: 'cycling-shorts-m',
    productId: 'cycling-shorts',
    name: 'M',
    price: 45,
  },
  {
    id: 'cycling-shorts-l',
    productId: 'cycling-shorts',
    name: 'L',
    price: 50,
  },
  {
    id: 'cycling-shorts-s-2',
    productId: 'cycling-shorts',
    name: 'S',
    price: 55,
  },
  {
    id: 'cycling-shorts-m-2',
    productId: 'cycling-shorts',
    name: 'M',
    price: 60,
  },
  {
    id: 'cycling-shorts-l-2',
    productId: 'cycling-shorts',
    name: 'L',
    price: 65,
  },
  {
    id: 'cycling-shorts-xl',
    productId: 'cycling-shorts',
    name: 'XL',
    price: 70,
  },

  // ==========================================
  // LEOTARD ADULT - LONG SLEEVES
  // ==========================================

  {
    id: 'leotard-adult-long-s',
    productId: 'leotard-adult-long',
    name: 'S',
    price: 125,
  },
  {
    id: 'leotard-adult-long-m',
    productId: 'leotard-adult-long',
    name: 'M',
    price: 135,
  },
  {
    id: 'leotard-adult-long-l',
    productId: 'leotard-adult-long',
    name: 'L',
    price: 145,
  },
  {
    id: 'leotard-adult-long-xl',
    productId: 'leotard-adult-long',
    name: 'XL',
    price: 155,
  },
  {
    id: 'leotard-adult-long-2x',
    productId: 'leotard-adult-long',
    name: '2X',
    price: 165,
  },

  // ==========================================
  // LEOTARD ADULT - SHORT SLEEVES
  // ==========================================

  {
    id: 'leotard-adult-short-s',
    productId: 'leotard-adult-short',
    name: 'S',
    price: 115,
  },
  {
    id: 'leotard-adult-short-m',
    productId: 'leotard-adult-short',
    name: 'M',
    price: 125,
  },
  {
    id: 'leotard-adult-short-l',
    productId: 'leotard-adult-short',
    name: 'L',
    price: 135,
  },
  {
    id: 'leotard-adult-short-xl',
    productId: 'leotard-adult-short',
    name: 'XL',
    price: 145,
  },
  {
    id: 'leotard-adult-short-2x',
    productId: 'leotard-adult-short',
    name: '2X',
    price: 155,
  },

  // ==========================================
  // TIGHTS / SAKBET - KIDS
  // ==========================================

  {
    id: 'tights-kids-s',
    productId: 'tights-sakbet-kids',
    name: 'S',
    price: 65,
  },
  {
    id: 'tights-kids-m',
    productId: 'tights-sakbet-kids',
    name: 'M',
    price: 70,
  },
  {
    id: 'tights-kids-l',
    productId: 'tights-sakbet-kids',
    name: 'L',
    price: 75,
  },
  {
    id: 'tights-kids-xl',
    productId: 'tights-sakbet-kids',
    name: 'XL',
    price: 80,
  },
  {
    id: 'tights-kids-2x',
    productId: 'tights-sakbet-kids',
    name: '2X',
    price: 85,
  },
  {
    id: 'tights-kids-a',
    productId: 'tights-sakbet-kids',
    name: 'A',
    price: 90,
  },

  // ==========================================
  // TIGHTS / SAKBET - ADULT
  // ==========================================

  {
    id: 'tights-adult-s',
    productId: 'tights-sakbet-adult',
    name: 'S',
    price: 90,
  },
  {
    id: 'tights-adult-m',
    productId: 'tights-sakbet-adult',
    name: 'M',
    price: 95,
  },
  {
    id: 'tights-adult-l',
    productId: 'tights-sakbet-adult',
    name: 'L',
    price: 100,
  },
  {
    id: 'tights-adult-xl',
    productId: 'tights-sakbet-adult',
    name: 'XL',
    price: 105,
  },
  {
    id: 'tights-adult-2x',
    productId: 'tights-sakbet-adult',
    name: '2X',
    price: 110,
  },
];
