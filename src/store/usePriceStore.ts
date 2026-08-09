import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Price } from '../types/localModels';

const mmkv = createMMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name),
};

type PriceStore = {
  prices: Price[];

  // Setters
  addPrice: (priceData: Omit<Price, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => void;
  updatePrice: (id: string, newPrice: number) => void;
  deletePrice: (id: string) => void;
  setAllPrices: (prices: Price[]) => void;

  // Getters
  getAllPrices: () => Price[];
  getPriceBySizeId: (sizeId: string) => Price | undefined;
};

export const usePriceStore = create<PriceStore>()(
  persist(
    (set, get) => ({
      prices: [],

      addPrice: (priceData) =>
        set((state) => ({
          prices: [
            ...state.prices,
            {
              ...priceData,
              id: priceData.id ?? `price-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              createdAt: priceData.createdAt ?? new Date().toISOString(),
            },
          ],
        })),

      updatePrice: (id, newPrice) =>
        set((state) => ({
          prices: state.prices.map((p) =>
            p.id === id ? { ...p, price: newPrice } : p
          ),
        })),

      deletePrice: (id) =>
        set((state) => ({
          prices: state.prices.filter((p) => p.id !== id),
        })),

      setAllPrices: (prices) => set({ prices }),

      getAllPrices: () => get().prices,

      /**
       * Gets the latest active price for a sizeId.
       */
      getPriceBySizeId: (sizeId) => {
        const matches = get().prices.filter((p) => p.sizeId === sizeId);
        if (matches.length === 0) return undefined;

        // Sort by createdAt descending to return the newest active price
        return matches.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      },
    }),
    {
      name: 'global-price-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);