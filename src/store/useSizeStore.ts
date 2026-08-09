import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Size } from '../types/localModels';

const mmkv = createMMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name),
};

type SizeStore = {
  sizes: Size[];

  // Setters
  addSize: (size: Size) => void;
  updateSize: (id: string, name: string, price: number) => void;
  deleteSize: (id: string) => void;
  setAllSizes: (sizes: Size[]) => void;

  // Getters
  getAllSizes: () => Size[];
  getSizesByProductId: (productId: string) => Size[];
};

export const useSizeStore = create<SizeStore>()(
  persist(
    (set, get) => ({
      sizes: [],

      addSize: (size) =>
        set((state) => ({
          sizes: [...state.sizes, size],
        })),

      updateSize: (id, name, price) =>
        set((state) => ({
          sizes: state.sizes.map((s) => (s.id === id ? { ...s, name, price } : s)),
        })),

      deleteSize: (id) =>
        set((state) => ({
          sizes: state.sizes.filter((s) => s.id !== id),
        })),

      setAllSizes: (sizes) => set({ sizes }),

      getAllSizes: () => get().sizes,

      getSizesByProductId: (productId) => get().sizes.filter((s) => s.productId === productId),
    }),
    {
      name: 'global-size-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
