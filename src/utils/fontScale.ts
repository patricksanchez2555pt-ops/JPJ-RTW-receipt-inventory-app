import { useFontScaleStore } from '@/store/useFontScaleStore';

export const f = (n: number) => {
  const scale = useFontScaleStore.getState().fontScale ?? 1;
  return Math.round(n * scale);
};

export const getFontScale = () => useFontScaleStore.getState().fontScale ?? 1;
