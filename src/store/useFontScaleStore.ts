import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage,persist } from 'zustand/middleware';

type FontScaleState = {
  fontScale: number;
  setFontScale: (scale: number) => void;
};

const mmkv = createMMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name),
};

export const useFontScaleStore = create<FontScaleState>()(
  persist(
    (set) => ({
      fontScale: 1.2,
      setFontScale: (scale: number) => set({ fontScale: scale }),
    }),
    {
      name: 'font-scale',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export default useFontScaleStore;
