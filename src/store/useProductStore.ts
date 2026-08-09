import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Product } from '../types/localModels';

const mmkv = createMMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name),
};

type ProductStore = {
  products: Product[];

  // Setters
  addProduct: (product: Omit<Product, 'createdAt'>) => void;
  updateProduct: (id: string, name: string) => void;
  deleteProduct: (id: string) => void;
  setAllProducts: (products: Product[]) => void;

  // Getters
  getAllProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (productData) =>
        set((state) => ({
          products: [...state.products, { ...productData, createdAt: new Date().toISOString() }],
        })),

      updateProduct: (id, name) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      setAllProducts: (products) => set({ products }),

      getAllProducts: () => get().products,

      getProductById: (id) => get().products.find((p) => p.id === id),
    }),
    {
      name: 'global-product-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
