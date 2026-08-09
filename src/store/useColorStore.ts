import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Color } from '../types/localModels';

const mmkv = createMMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name),
};

type ColorStore = {
  colors: Color[];

  // Setters
  addColor: (color: Color) => void;
  updateColor: (id: string, name: string, hexValue: string) => void;
  deleteColor: (id: string) => void;
  reorderColors: (productId: string, reorderedColors: Color[]) => void;
  setAllColors: (colors: Color[]) => void;

  // Getters
  getAllColors: () => Color[];
  getColorsByProductId: (productId: string) => Color[];
};

export const useColorStore = create<ColorStore>()(
  persist(
    (set, get) => ({
      colors: [],

      addColor: (color) =>
        set((state) => ({
          colors: [...state.colors, color],
        })),

      updateColor: (id, name, hexValue) =>
        set((state) => ({
          colors: state.colors.map((c) =>
            c.id === id ? { ...c, name, hexValue } : c
          ),
        })),

      deleteColor: (id) =>
        set((state) => ({
          colors: state.colors.filter((c) => c.id !== id),
        })),

      reorderColors: (productId, reorderedColors) =>
        set((state) => {
          const otherColors = state.colors.filter((c) => c.productId !== productId);
          return { colors: [...otherColors, ...reorderedColors] };
        }),

      setAllColors: (colors) => set({ colors }),

      getAllColors: () => get().colors,

      getColorsByProductId: (productId) =>
        get().colors.filter((c) => c.productId === productId),
    }),
    {
      name: 'global-color-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);