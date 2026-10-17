import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LaborItem } from '../types/localModels';

const storage = createMMKV({ id: 'labor-item-storage' });

type LaborItemRecord = Record<string, Record<string, LaborItem>>;
type PersistedLaborItems = LaborItem[] | Record<string, LaborItem> | LaborItemRecord;

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

export const getLaborItemKey = (
  productId: string,
  sizeId: string,
  operationId: string,
  date: string,
) => `${productId}:${sizeId}:${operationId}:${date}`;

function toLaborItemRecord(items: PersistedLaborItems): LaborItemRecord {
  const laborItems: LaborItemRecord = {};
  const entries = Array.isArray(items)
    ? items
    : Object.values(items).flatMap((entry) =>
        'workerId' in entry ? [entry] : Object.values(entry),
      );

  for (const item of entries) {
    const key = getLaborItemKey(item.productId, item.sizeId, item.operationId, item.date);
    laborItems[key] = {
      ...laborItems[key],
      [item.workerId]: item,
    };
  }

  return laborItems;
}

function findLaborItemEntry(laborItems: LaborItemRecord, id: string) {
  for (const [key, workerItems] of Object.entries(laborItems)) {
    for (const [workerId, item] of Object.entries(workerItems)) {
      if (item.id === id) return { key, workerId, item };
    }
  }

  return undefined;
}

function getLaborItemsArray(laborItems: LaborItemRecord) {
  return Object.values(laborItems).flatMap((workerItems) => Object.values(workerItems));
}

type NewLaborItem = Omit<LaborItem, 'id' | 'subtotal'>;
type LaborItemUpdates = Partial<Omit<LaborItem, 'id' | 'subtotal'>>;

type LaborItemStore = {
  laborItems: LaborItemRecord;
  addLaborItem: (laborItem: NewLaborItem) => LaborItem;
  updateLaborItem: (id: string, updates: LaborItemUpdates) => LaborItem | undefined;
  deleteLaborItem: (id: string) => void;
  setAllLaborItems: (laborItems: LaborItem[]) => void;
  getLaborItemsArray: () => LaborItem[];
  getAllLaborItems: () => LaborItem[];
  getLaborItemById: (id: string) => LaborItem | undefined;
  getLaborItemByKey: (key: string, workerId: string) => LaborItem | undefined;
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
          createdLaborItem.date,
        );

        set((state) => ({
          laborItems: {
            ...state.laborItems,
            [key]: {
              ...state.laborItems[key],
              [createdLaborItem.workerId]: createdLaborItem,
            },
          },
        }));
        return createdLaborItem;
      },

      updateLaborItem: (id, updates) => {
        const existingEntry = findLaborItemEntry(get().laborItems, id);
        if (!existingEntry) return undefined;
        const existing = existingEntry.item;

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
          updatedLaborItem.date,
        );

        set((state) => {
          const laborItems = { ...state.laborItems };
          const previousWorkerItems = { ...laborItems[existingEntry.key] };
          delete previousWorkerItems[existingEntry.workerId];

          if (Object.keys(previousWorkerItems).length > 0) {
            laborItems[existingEntry.key] = previousWorkerItems;
          } else {
            delete laborItems[existingEntry.key];
          }

          laborItems[updatedKey] = {
            ...laborItems[updatedKey],
            [updatedLaborItem.workerId]: updatedLaborItem,
          };

          return { laborItems };
        });

        return updatedLaborItem;
      },

      deleteLaborItem: (id) =>
        set((state) => {
          const entry = findLaborItemEntry(state.laborItems, id);
          if (!entry) return state;

          const laborItems = { ...state.laborItems };
          const workerItems = { ...laborItems[entry.key] };
          delete workerItems[entry.workerId];

          if (Object.keys(workerItems).length > 0) {
            laborItems[entry.key] = workerItems;
          } else {
            delete laborItems[entry.key];
          }

          return { laborItems };
        }),

      setAllLaborItems: (laborItems) => set({ laborItems: toLaborItemRecord(laborItems) }),
      getLaborItemsArray: () => getLaborItemsArray(get().laborItems),
      getAllLaborItems: () => getLaborItemsArray(get().laborItems),
      getLaborItemById: (id) => findLaborItemEntry(get().laborItems, id)?.item,
      getLaborItemByKey: (key, workerId) => get().laborItems[key]?.[workerId],
      getLaborItemsByWorkerId: (workerId) =>
        getLaborItemsArray(get().laborItems).filter((laborItem) => laborItem.workerId === workerId),
      getLaborItemsByDate: (date) =>
        getLaborItemsArray(get().laborItems).filter((laborItem) => laborItem.date === date),
    }),
    {
      name: 'labor-items',
      storage: createJSONStorage(() => mmkvStorage),
      merge: (persistedState, currentState) => {
        const persistedLaborItems = (persistedState as { laborItems?: PersistedLaborItems })
          .laborItems;

        return {
          ...currentState,
          ...(persistedState as Partial<LaborItemStore>),
          laborItems: toLaborItemRecord(persistedLaborItems ?? []),
        };
      },
    },
  ),
);
