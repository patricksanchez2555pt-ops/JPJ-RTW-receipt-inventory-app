import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LaborRate } from '../types/localModels';

const storage = createMMKV({ id: 'labor-rate-storage' });

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

type LaborRateStore = {
  laborRates: LaborRate[];
  addLaborRate: (laborRate: Omit<LaborRate, 'id' | 'updatedAt'>) => LaborRate;
  updateLaborRate: (id: string, ratePerUnit: number) => void;
  deleteLaborRate: (id: string) => void;
  setAllLaborRates: (laborRates: LaborRate[]) => void;
  getAllLaborRates: () => LaborRate[];
  getLaborRate: (productId: string, sizeId: string, operationId: string) => LaborRate | undefined;
  getLaborRatesByProductId: (productId: string) => LaborRate[];
  getLaborRatesByOperationId: (operationId: string) => LaborRate[];
};

export const useLaborRateStore = create<LaborRateStore>()(
  persist(
    (set, get) => ({
      laborRates: [],

      addLaborRate: (laborRate) => {
        const existing = get().getLaborRate(
          laborRate.productId,
          laborRate.sizeId,
          laborRate.operationId,
        );
        const updatedAt = new Date().toISOString();

        if (existing) {
          const updatedLaborRate = { ...existing, ratePerUnit: laborRate.ratePerUnit, updatedAt };
          set((state) => ({
            laborRates: state.laborRates.map((rate) =>
              rate.id === existing.id ? updatedLaborRate : rate,
            ),
          }));
          return updatedLaborRate;
        }

        const createdLaborRate: LaborRate = {
          ...laborRate,
          id: `labor-rate-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          updatedAt,
        };

        set((state) => ({ laborRates: [...state.laborRates, createdLaborRate] }));
        return createdLaborRate;
      },

      updateLaborRate: (id, ratePerUnit) =>
        set((state) => ({
          laborRates: state.laborRates.map((laborRate) =>
            laborRate.id === id
              ? { ...laborRate, ratePerUnit, updatedAt: new Date().toISOString() }
              : laborRate,
          ),
        })),

      deleteLaborRate: (id) =>
        set((state) => ({
          laborRates: state.laborRates.filter((laborRate) => laborRate.id !== id),
        })),

      setAllLaborRates: (laborRates) => set({ laborRates }),
      getAllLaborRates: () => get().laborRates,
      getLaborRate: (productId, sizeId, operationId) =>
        get().laborRates.find(
          (laborRate) =>
            laborRate.productId === productId &&
            laborRate.sizeId === sizeId &&
            laborRate.operationId === operationId,
        ),
      getLaborRatesByProductId: (productId) =>
        get().laborRates.filter((laborRate) => laborRate.productId === productId),
      getLaborRatesByOperationId: (operationId) =>
        get().laborRates.filter((laborRate) => laborRate.operationId === operationId),
    }),
    {
      name: 'labor-rates',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
