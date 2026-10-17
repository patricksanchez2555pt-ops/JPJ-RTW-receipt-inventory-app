import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LaborItem } from '../types/localModels';

const storage = createMMKV({ id: 'labor-item-storage' });

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

export const getLaborItemKey = (
  productId: string,
  sizeId: string,
  operationId: string,
  workerId: string,
  date: string,
) => `${productId}:${sizeId}:${operationId}:${workerId}:${date}`;

function toLaborItemRecord(items: LaborItem[] | Record<string, LaborItem>) {
  const laborItems: Record<string, LaborItem> = {};

  for (const item of Array.isArray(items) ? items : Object.values(items)) {
    laborItems[
      getLaborItemKey(item.productId, item.sizeId, item.operationId, item.workerId, item.date)
    ] = item;
  }

  return laborItems;
}

type NewLaborItem = Omit<LaborItem, 'id' | 'subtotal'>;
type LaborItemUpdates = Partial<Omit<LaborItem, 'id' | 'subtotal'>>;

type LaborItemStore = {
  laborItems: Record<string, LaborItem>;
  addLaborItem: (laborItem: NewLaborItem) => LaborItem;
  updateLaborItem: (id: string, updates: LaborItemUpdates) => LaborItem | undefined;
  deleteLaborItem: (id: string) => void;
  setAllLaborItems: (laborItems: LaborItem[]) => void;
  getLaborItemsArray: () => LaborItem[];
  getAllLaborItems: () => LaborItem[];
  getLaborItemById: (id: string) => LaborItem | undefined;
  getLaborItemByKey: (key: string) => LaborItem | undefined;
  getLaborItemsByWorkerId: (workerId: string) => LaborItem[];
  getLaborItemsByDate: (date: string) => LaborItem[];
};

export const useLaborItemStore = create<LaborItemStore>()(
  persist(
    (set, get) => ({
      laborItems: {},

      addLaborItem: (laborItem) => {
        const createdLaborItem: LaborItem = {
          ...laborItem,
          id: `labor-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          subtotal: laborItem.quantity * laborItem.ratePerUnit,
        };

        const key = getLaborItemKey(
          createdLaborItem.productId,
          createdLaborItem.sizeId,
          createdLaborItem.operationId,
          createdLaborItem.workerId,
          createdLaborItem.date,
        );

        set((state) => ({
          laborItems: { ...state.laborItems, [key]: createdLaborItem },
        }));
        return createdLaborItem;
      },

      updateLaborItem: (id, updates) => {
        const existingEntry = Object.entries(get().laborItems).find(
          ([, laborItem]) => laborItem.id === id,
        );
        const existing = existingEntry?.[1];
        if (!existing) return undefined;

        const updatedLaborItem: LaborItem = {
          ...existing,
          ...updates,
          subtotal:
            (updates.quantity ?? existing.quantity) * (updates.ratePerUnit ?? existing.ratePerUnit),
        };

        const updatedKey = getLaborItemKey(
          updatedLaborItem.productId,
          updatedLaborItem.sizeId,
          updatedLaborItem.operationId,
          updatedLaborItem.workerId,
          updatedLaborItem.date,
        );

        set((state) => {
          const laborItems = { ...state.laborItems };
          delete laborItems[existingEntry[0]];
          laborItems[updatedKey] = updatedLaborItem;

          return { laborItems };
        });

        return updatedLaborItem;
      },

      deleteLaborItem: (id) =>
        set((state) => {
          const entry = Object.entries(state.laborItems).find(
            ([, laborItem]) => laborItem.id === id,
          );
          if (!entry) return state;

          const laborItems = { ...state.laborItems };
          delete laborItems[entry[0]];

          return { laborItems };
        }),

      setAllLaborItems: (laborItems) => set({ laborItems: toLaborItemRecord(laborItems) }),
      getLaborItemsArray: () => Object.values(get().laborItems),
      getAllLaborItems: () => Object.values(get().laborItems),
      getLaborItemById: (id) =>
        Object.values(get().laborItems).find((laborItem) => laborItem.id === id),
      getLaborItemByKey: (key) => get().laborItems[key],
      getLaborItemsByWorkerId: (workerId) =>
        Object.values(get().laborItems).filter((laborItem) => laborItem.workerId === workerId),
      getLaborItemsByDate: (date) =>
        Object.values(get().laborItems).filter((laborItem) => laborItem.date === date),
    }),
    {
      name: 'labor-items',
      storage: createJSONStorage(() => mmkvStorage),
      merge: (persistedState, currentState) => {
        const persistedLaborItems = (persistedState as Partial<LaborItemStore>).laborItems;

        return {
          ...currentState,
          ...(persistedState as Partial<LaborItemStore>),
          laborItems: toLaborItemRecord(persistedLaborItems ?? []),
        };
      },
    },
  ),
);
