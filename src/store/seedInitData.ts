import { useColorStore } from '@/store/useColorStore';
import { useCustomerPricingStore } from '@/store/useCustomerPricingStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useProductStore } from '@/store/useProductStore';
import { useSizeStore } from '@/store/useSizeStore';
import type { Color, Product, Size } from '@/types/localModels';

// ==========================================
// CONFIG
// ==========================================

const CONFIG = {
  JOGGING_PANTS: {
    PRODUCT: {
      id: 'jogging-pants',
      name: 'Jogging Pants',
      createdAt: new Date().toISOString(),
    } satisfies Product,

    COLORS: [
      {
        id: 'jogging-pants-black',
        productId: 'jogging-pants',
        name: 'Black',
        hexValue: '#000000',
      },
      {
        id: 'jogging-pants-gray',
        productId: 'jogging-pants',
        name: 'Gray',
        hexValue: 'rgb(92, 91, 91)',
      },
      {
        id: 'jogging-pants-light-blue',
        productId: 'jogging-pants',
        name: 'Light Blue',
        hexValue: '#64c8ea',
      },
      {
        id: 'jogging-pants-royal-blue',
        productId: 'jogging-pants',
        name: 'Royal Blue',
        hexValue: '#0000FF',
      },
      {
        id: 'jogging-pants-navy-blue',
        productId: 'jogging-pants',
        name: 'Navy Blue',
        hexValue: '#000080',
      },
      {
        id: 'jogging-pants-orange',
        productId: 'jogging-pants',
        name: 'Orange',
        hexValue: '#FA5000',
      },
      {
        id: 'jogging-pants-red',
        productId: 'jogging-pants',
        name: 'Red',
        hexValue: '#FF0000',
      },
      {
        id: 'jogging-pants-maroon',
        productId: 'jogging-pants',
        name: 'Maroon',
        hexValue: '#680000',
      },
      {
        id: 'jogging-pants-white',
        productId: 'jogging-pants',
        name: 'White',
        hexValue: '#FFFFFF',
      },
      {
        id: 'jogging-pants-green',
        productId: 'jogging-pants',
        name: 'Green',
        hexValue: '#008000',
      },
      {
        id: 'jogging-pants-yellow',
        productId: 'jogging-pants',
        name: 'Yellow',
        hexValue: '#FFFF00',
      },
      {
        id: 'jogging-pants-pink',
        productId: 'jogging-pants',
        name: 'Pink',
        hexValue: '#FFC0CB',
      },
      {
        id: 'jogging-pants-violet',
        productId: 'jogging-pants',
        name: 'Violet',
        hexValue: '#800080',
      },
    ] satisfies Color[],

    SIZES: [
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
    ] satisfies Size[],
  },

  LEOTARD_LONG: {
    PRODUCT: {
      id: 'leotard-long',
      name: 'Leotard - Long Sleeves',
      createdAt: new Date().toISOString(),
    } satisfies Product,

    COLORS: [
      {
        id: 'leotard-long-black',
        productId: 'leotard-long',
        name: 'Black',
        hexValue: '#000000',
      },
      {
        id: 'leotard-long-white',
        productId: 'leotard-long',
        name: 'White',
        hexValue: '#FFFFFF',
      },
      {
        id: 'leotard-long-skin-tone',
        productId: 'leotard-long',
        name: 'Skin tone',
        hexValue: '#F2C08E',
      },
    ] satisfies Color[],

    SIZES: [
      {
        id: 'leotard-long-s',
        productId: 'leotard-long',
        name: 'S',
        price: 85,
      },
      {
        id: 'leotard-long-m',
        productId: 'leotard-long',
        name: 'M',
        price: 90,
      },
      {
        id: 'leotard-long-l',
        productId: 'leotard-long',
        name: 'L',
        price: 95,
      },
      {
        id: 'leotard-long-xl',
        productId: 'leotard-long',
        name: 'XL',
        price: 100,
      },
      {
        id: 'leotard-long-2x',
        productId: 'leotard-long',
        name: '2X',
        price: 105,
      },
      {
        id: 'leotard-long-a',
        productId: 'leotard-long',
        name: 'A',
        price: 115,
      },
      {
        id: 'leotard-long-adult-s',
        productId: 'leotard-long',
        name: 'A - S',
        price: 125,
      },
      {
        id: 'leotard-long-adult-m',
        productId: 'leotard-long',
        name: 'A - M',
        price: 135,
      },
      {
        id: 'leotard-long-adult-l',
        productId: 'leotard-long',
        name: 'A - L',
        price: 145,
      },
      {
        id: 'leotard-long-adult-xl',
        productId: 'leotard-long',
        name: 'A - XL',
        price: 155,
      },
      {
        id: 'leotard-long-adult-2x',
        productId: 'leotard-long',
        name: 'A - 2X',
        price: 165,
      },
    ] satisfies Size[],
  },

  LEOTARD_SHORT: {
    PRODUCT: {
      id: 'leotard-short',
      name: 'Leotard - Short Sleeves',
      createdAt: new Date().toISOString(),
    } satisfies Product,

    COLORS: [
      {
        id: 'leotard-short-black',
        productId: 'leotard-short',
        name: 'Black',
        hexValue: '#000000',
      },
      {
        id: 'leotard-short-white',
        productId: 'leotard-short',
        name: 'White',
        hexValue: '#FFFFFF',
      },
      {
        id: 'leotard-short-skin-tone',
        productId: 'leotard-short',
        name: 'Skin tone',
        hexValue: '#F2C08E',
      },
    ] satisfies Color[],

    SIZES: [
      {
        id: 'leotard-short-s',
        productId: 'leotard-short',
        name: 'S',
        price: 75,
      },
      {
        id: 'leotard-short-m',
        productId: 'leotard-short',
        name: 'M',
        price: 80,
      },
      {
        id: 'leotard-short-l',
        productId: 'leotard-short',
        name: 'L',
        price: 85,
      },
      {
        id: 'leotard-short-xl',
        productId: 'leotard-short',
        name: 'XL',
        price: 90,
      },
      {
        id: 'leotard-short-2x',
        productId: 'leotard-short',
        name: '2X',
        price: 95,
      },
      {
        id: 'leotard-short-a',
        productId: 'leotard-short',
        name: 'A',
        price: 105,
      },
      {
        id: 'leotard-short-adult-s',
        productId: 'leotard-short',
        name: 'A - S',
        price: 115,
      },
      {
        id: 'leotard-short-adult-m',
        productId: 'leotard-short',
        name: 'A - M',
        price: 125,
      },
      {
        id: 'leotard-short-adult-l',
        productId: 'leotard-short',
        name: 'A - L',
        price: 135,
      },
      {
        id: 'leotard-short-adult-xl',
        productId: 'leotard-short',
        name: 'A - XL',
        price: 145,
      },
      {
        id: 'leotard-short-adult-2x',
        productId: 'leotard-short',
        name: 'A - 2X',
        price: 155,
      },
    ] satisfies Size[],
  },

  CYCLING_SHORTS: {
    PRODUCT: {
      id: 'cycling-shorts',
      name: 'Cycling Shorts',
      createdAt: new Date().toISOString(),
    } satisfies Product,

    COLORS: [
      {
        id: 'cycling-shorts-black',
        productId: 'cycling-shorts',
        name: 'Black',
        hexValue: '#000000',
      },
      {
        id: 'cycling-shorts-white',
        productId: 'cycling-shorts',
        name: 'White',
        hexValue: '#FFFFFF',
      },
      {
        id: 'cycling-shorts-skin-tone',
        productId: 'cycling-shorts',
        name: 'Skin tone',
        hexValue: '#F2C08E',
      },
    ] satisfies Color[],

    SIZES: [
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
        name: 'A - S',
        price: 55,
      },
      {
        id: 'cycling-shorts-m-2',
        productId: 'cycling-shorts',
        name: 'A - M',
        price: 60,
      },
      {
        id: 'cycling-shorts-l-2',
        productId: 'cycling-shorts',
        name: 'A - L',
        price: 65,
      },
      {
        id: 'cycling-shorts-xl',
        productId: 'cycling-shorts',
        name: 'A - XL',
        price: 70,
      },
    ] satisfies Size[],
  },

  TIGHTS_SAKBET: {
    PRODUCT: {
      id: 'tights-sakbet',
      name: 'Tights / Sakbet',
      createdAt: new Date().toISOString(),
    } satisfies Product,

    COLORS: [
      {
        id: 'tights-sakbet-black',
        productId: 'tights-sakbet',
        name: 'Black',
        hexValue: '#000000',
      },
      {
        id: 'tights-sakbet-white',
        productId: 'tights-sakbet',
        name: 'White',
        hexValue: '#FFFFFF',
      },
      {
        id: 'tights-sakbet-skin-tone',
        productId: 'tights-sakbet',
        name: 'Skin tone',
        hexValue: '#F2C08E',
      },
    ] satisfies Color[],

    SIZES: [
      {
        id: 'tights-sakbet-s',
        productId: 'tights-sakbet',
        name: 'S',
        price: 65,
      },
      {
        id: 'tights-sakbet-m',
        productId: 'tights-sakbet',
        name: 'M',
        price: 70,
      },
      {
        id: 'tights-sakbet-l',
        productId: 'tights-sakbet',
        name: 'L',
        price: 75,
      },
      {
        id: 'tights-sakbet-xl',
        productId: 'tights-sakbet',
        name: 'XL',
        price: 80,
      },
      {
        id: 'tights-sakbet-2x',
        productId: 'tights-sakbet',
        name: '2X',
        price: 85,
      },
      {
        id: 'tights-sakbet-a',
        productId: 'tights-sakbet',
        name: 'A',
        price: 90,
      },
      {
        id: 'tights-sakbet-adult-s',
        productId: 'tights-sakbet',
        name: 'A - S',
        price: 90,
      },
      {
        id: 'tights-sakbet-adult-m',
        productId: 'tights-sakbet',
        name: 'A - M',
        price: 95,
      },
      {
        id: 'tights-sakbet-adult-l',
        productId: 'tights-sakbet',
        name: 'A - L',
        price: 100,
      },
      {
        id: 'tights-sakbet-adult-xl',
        productId: 'tights-sakbet',
        name: 'A - XL',
        price: 105,
      },
      {
        id: 'tights-sakbet-adult-2x',
        productId: 'tights-sakbet',
        name: 'A - 2X',
        price: 110,
      },
    ] satisfies Size[],
  },

  LEOTARD_SET_LONG: {
    PRODUCT: {
      id: 'leotard-set-long',
      name: 'Leotard Set - Long Sleeves',
      createdAt: new Date().toISOString(),
    } satisfies Product,

    COLORS: [
      {
        id: 'leotard-set-long-black',
        productId: 'leotard-set-long',
        name: 'Black',
        hexValue: '#000000',
      },
      {
        id: 'leotard-set-long-white',
        productId: 'leotard-set-long',
        name: 'White',
        hexValue: '#FFFFFF',
      },
      {
        id: 'leotard-set-long-skin-tone',
        productId: 'leotard-set-long',
        name: 'Skin tone',
        hexValue: '#F2C08E',
      },
    ] satisfies Color[],

    SIZES: [
      {
        id: 'leotard-set-long-s',
        productId: 'leotard-set-long',
        name: 'S',
        price: 150,
      },
      {
        id: 'leotard-set-long-m',
        productId: 'leotard-set-long',
        name: 'M',
        price: 160,
      },
      {
        id: 'leotard-set-long-l',
        productId: 'leotard-set-long',
        name: 'L',
        price: 170,
      },
      {
        id: 'leotard-set-long-xl',
        productId: 'leotard-set-long',
        name: 'XL',
        price: 180,
      },
      {
        id: 'leotard-set-long-2x',
        productId: 'leotard-set-long',
        name: '2X',
        price: 190,
      },
      {
        id: 'leotard-set-long-a',
        productId: 'leotard-set-long',
        name: 'A',
        price: 205,
      },
      {
        id: 'leotard-set-long-adult-s',
        productId: 'leotard-set-long',
        name: 'A - S',
        price: 215,
      },
      {
        id: 'leotard-set-long-adult-m',
        productId: 'leotard-set-long',
        name: 'A - M',
        price: 230,
      },
      {
        id: 'leotard-set-long-adult-l',
        productId: 'leotard-set-long',
        name: 'A - L',
        price: 245,
      },
      {
        id: 'leotard-set-long-adult-xl',
        productId: 'leotard-set-long',
        name: 'A - XL',
        price: 260,
      },
      {
        id: 'leotard-set-long-adult-2x',
        productId: 'leotard-set-long',
        name: 'A - 2X',
        price: 275,
      },
    ] satisfies Size[],
  },

  LEOTARD_SET_SHORT: {
    PRODUCT: {
      id: 'leotard-set-short',
      name: 'Leotard Set - Short Sleeves',
      createdAt: new Date().toISOString(),
    } satisfies Product,

    COLORS: [
      {
        id: 'leotard-set-short-black',
        productId: 'leotard-set-short',
        name: 'Black',
        hexValue: '#000000',
      },
      {
        id: 'leotard-set-short-white',
        productId: 'leotard-set-short',
        name: 'White',
        hexValue: '#FFFFFF',
      },
      {
        id: 'leotard-set-short-skin-tone',
        productId: 'leotard-set-short',
        name: 'Skin tone',
        hexValue: '#F2C08E',
      },
    ] satisfies Color[],

    SIZES: [
      {
        id: 'leotard-set-short-s',
        productId: 'leotard-set-short',
        name: 'S',
        price: 140,
      },
      {
        id: 'leotard-set-short-m',
        productId: 'leotard-set-short',
        name: 'M',
        price: 150,
      },
      {
        id: 'leotard-set-short-l',
        productId: 'leotard-set-short',
        name: 'L',
        price: 160,
      },
      {
        id: 'leotard-set-short-xl',
        productId: 'leotard-set-short',
        name: 'XL',
        price: 170,
      },
      {
        id: 'leotard-set-short-2x',
        productId: 'leotard-set-short',
        name: '2X',
        price: 180,
      },
      {
        id: 'leotard-set-short-a',
        productId: 'leotard-set-short',
        name: 'A',
        price: 195,
      },
      {
        id: 'leotard-set-short-adult-s',
        productId: 'leotard-set-short',
        name: 'A - S',
        price: 205,
      },
      {
        id: 'leotard-set-short-adult-m',
        productId: 'leotard-set-short',
        name: 'A - M',
        price: 220,
      },
      {
        id: 'leotard-set-short-adult-l',
        productId: 'leotard-set-short',
        name: 'A - L',
        price: 235,
      },
      {
        id: 'leotard-set-short-adult-xl',
        productId: 'leotard-set-short',
        name: 'A - XL',
        price: 250,
      },
      {
        id: 'leotard-set-short-adult-2x',
        productId: 'leotard-set-short',
        name: 'A - 2X',
        price: 265,
      },
    ] satisfies Size[],
  },
} as const;

// ==========================================
// DERIVED DATA
// ==========================================

const PRODUCTS: Product[] = Object.values(CONFIG).map(({ PRODUCT }) => PRODUCT);

const COLORS: Color[] = Object.values(CONFIG).flatMap(({ COLORS }) => COLORS);

const SIZES: Size[] = Object.values(CONFIG).flatMap(({ SIZES }) => SIZES);

// ==========================================
// CUSTOMER DATA
// ==========================================

const MARIVIC_AND_MARICAR_DATA = [
  // Jogging - Kids
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-4', price: 75 },
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-6', price: 80 },
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-8', price: 85 },
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-10', price: 90 },
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-12', price: 95 },
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-14', price: 100 },
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-16', price: 105 },
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-18', price: 110 },
  // { productId: 'jogging-pants', sizeId: 'jogging-pants-20', price: 115 },

  // Sakbit kids
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-s', price: 60 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-m', price: 65 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-l', price: 70 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-xl', price: 75 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-2x', price: 80 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-a', price: 85 },

  // Sakbit adult
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-adult-s', price: 85 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-adult-m', price: 90 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-adult-l', price: 95 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-adult-xl', price: 100 },
  { productId: 'tights-sakbet', sizeId: 'tights-sakbet-adult-2x', price: 105 },

  // L/S Kids
  { productId: 'leotard-long', sizeId: 'leotard-long-s', price: 80 },
  { productId: 'leotard-long', sizeId: 'leotard-long-m', price: 85 },
  { productId: 'leotard-long', sizeId: 'leotard-long-l', price: 90 },
  { productId: 'leotard-long', sizeId: 'leotard-long-xl', price: 95 },
  { productId: 'leotard-long', sizeId: 'leotard-long-2x', price: 100 },
  { productId: 'leotard-long', sizeId: 'leotard-long-a', price: 110 },

  // L/S Adult
  { productId: 'leotard-long', sizeId: 'leotard-long-adult-s', price: 120 },
  { productId: 'leotard-long', sizeId: 'leotard-long-adult-m', price: 130 },
  { productId: 'leotard-long', sizeId: 'leotard-long-adult-l', price: 140 },
  { productId: 'leotard-long', sizeId: 'leotard-long-adult-2x', price: 150 },
  { productId: 'leotard-long', sizeId: 'leotard-long-adult-a', price: 160 },

  // L/S Kids Set
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-s', price: 140 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-m', price: 150 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-l', price: 160 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-xl', price: 170 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-2x', price: 180 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-a', price: 195 },

  // L/S Adult Set
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-adult-s', price: 205 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-adult-m', price: 220 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-adult-l', price: 235 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-adult-2x', price: 250 },
  { productId: 'leotard-set-long', sizeId: 'leotard-set-long-adult-a', price: 265 },

  // Short Sleeve Kids
  { productId: 'leotard-short', sizeId: 'leotard-short-s', price: 70 },
  { productId: 'leotard-short', sizeId: 'leotard-short-m', price: 75 },
  { productId: 'leotard-short', sizeId: 'leotard-short-l', price: 80 },
  { productId: 'leotard-short', sizeId: 'leotard-short-xl', price: 85 },
  { productId: 'leotard-short', sizeId: 'leotard-short-2x', price: 90 },
  { productId: 'leotard-short', sizeId: 'leotard-short-a', price: 100 },

  // Short Sleeve Adult
  { productId: 'leotard-short', sizeId: 'leotard-short-adult-s', price: 110 },
  { productId: 'leotard-short', sizeId: 'leotard-short-adult-m', price: 120 },
  { productId: 'leotard-short', sizeId: 'leotard-short-adult-l', price: 130 },
  { productId: 'leotard-short', sizeId: 'leotard-short-adult-xl', price: 140 },
  { productId: 'leotard-short', sizeId: 'leotard-short-adult-2x', price: 150 },

  // S/S Kids Set
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-s', price: 130 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-m', price: 140 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-l', price: 150 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-xl', price: 160 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-2x', price: 170 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-a', price: 185 },

  // S/S Adult Set
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-adult-s', price: 195 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-adult-m', price: 210 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-adult-l', price: 225 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-adult-xl', price: 240 },
  { productId: 'leotard-set-short', sizeId: 'leotard-set-short-adult-2x', price: 255 },
];

const RIZZA_AND_JESSICA_DATA = [
  // Jogging - Kids
  { productId: 'jogging-pants', sizeId: 'jogging-pants-4', price: 70 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-6', price: 75 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-8', price: 80 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-10', price: 85 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-12', price: 90 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-14', price: 95 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-16', price: 100 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-18', price: 105 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-20', price: 110 },

  // Jogging - Adult
  { productId: 'jogging-pants', sizeId: 'jogging-pants-s', price: 120 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-m', price: 125 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-l', price: 130 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-xl', price: 135 },
  { productId: 'jogging-pants', sizeId: 'jogging-pants-2x', price: 140 },
];

const CUSTOMER_DATA = {
  Maricar: MARIVIC_AND_MARICAR_DATA,
  Marivic: MARIVIC_AND_MARICAR_DATA,
  Riza: RIZZA_AND_JESSICA_DATA,
  Jessica: RIZZA_AND_JESSICA_DATA,

  Jay: [
    // Jogging - Kids
    { productId: 'jogging-pants', sizeId: 'jogging-pants-4', price: 73 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-6', price: 78 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-8', price: 83 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-10', price: 88 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-12', price: 93 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-14', price: 98 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-16', price: 103 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-18', price: 108 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-20', price: 113 },

    // Jogging - Adult
    { productId: 'jogging-pants', sizeId: 'jogging-pants-s', price: 123 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-m', price: 128 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-l', price: 133 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-xl', price: 138 },
    { productId: 'jogging-pants', sizeId: 'jogging-pants-2x', price: 148 },
  ],
} as const;

// ==========================================
// SEED CUSTOMERS
// ==========================================

function seedCustomers() {
  const customerStore = useCustomerStore.getState();
  const customerPricingStore = useCustomerPricingStore.getState();

  Object.entries(CUSTOMER_DATA).forEach(([customerName, prices]) => {
    // Find an existing customer first so running the seed
    // multiple times does not create duplicate customers.
    let customer = customerStore.customers.find(
      (existingCustomer) => existingCustomer.name === customerName,
    );

    if (!customer) {
      customer = customerStore.addCustomer({
        name: customerName,
      });
    }

    prices.forEach(({ productId, sizeId, price }) => {
      if (!sizeId) {
        console.warn(
          `[seedInitialData] Could not resolve size: ` +
            `customer="${customerName}", ` +
            `product="${productId}", ` +
            `size="${sizeId}"`,
        );

        return;
      }

      customerPricingStore.addCustomerPrice({
        customerId: customer.id,
        productId,
        sizeId,
        price,
      });
    });
  });
}

// ==========================================
// SEED INITIAL DATA
// ==========================================

export function seedInitialData() {
  const productStore = useProductStore.getState();
  const colorStore = useColorStore.getState();
  const sizeStore = useSizeStore.getState();

  // Seed products.
  productStore.setAllProducts(PRODUCTS);

  // Seed colors.
  colorStore.setAllColors(COLORS);

  // Seed sizes.
  sizeStore.setAllSizes(SIZES);

  // Seed customers and customer-specific pricing.
  seedCustomers();
}
