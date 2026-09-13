import { useColorStore } from '@/store/useColorStore';
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
        id: 'jogging-pants-blue',
        productId: 'jogging-pants',
        name: 'Blue',
        hexValue: '#0000FF',
      },
      {
        id: 'jogging-pants-red',
        productId: 'jogging-pants',
        name: 'Red',
        hexValue: '#FF0000',
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
        id: 'jogging-pants-purple',
        productId: 'jogging-pants',
        name: 'Purple',
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
      // Kids
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

      // Adult
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
      // Kids
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

      // Adult
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
      // Kids
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

      // Adult
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
      // Kids
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

      // Adult
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
      // Kids
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

      // Adult
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
// SEED INITIAL DATA
// ==========================================

export function seedInitialInventoryData() {
  const productStore = useProductStore.getState();
  const colorStore = useColorStore.getState();
  const sizeStore = useSizeStore.getState();

  productStore.setAllProducts(PRODUCTS);

  colorStore.setAllColors(COLORS);

  sizeStore.setAllSizes(SIZES);
}
