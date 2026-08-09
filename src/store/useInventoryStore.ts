import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Inventory } from '../types/localModels';

const mmkv = createMMKV();

// Custom MMKV storage engine for Zustand persistence
const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name), // Use .remove() for MMKV v3+
};
// Helper function to build deterministic key lookups
export const getInventoryKey = (productId: string, colorId: string, sizeId: string) =>
  `${productId}:${colorId}:${sizeId}`;

type InventoryStore = {
  // Keyed dictionary for O(1) reads and updates
  inventory: Record<string, Inventory>;

  // Actions
  setQuantity: (productId: string, colorId: string, sizeId: string, quantity: number) => void;
  setAllInventory: (records: Inventory[]) => void;
  getInventoryArray: () => Inventory[];
  getQuantity: (key: string) => number;
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      inventory: {},

      // O(1) State Update
      setQuantity: (productId, colorId, sizeId, quantity) =>
        set((state) => {
          const key = getInventoryKey(productId, colorId, sizeId);
          const safeQty = Math.max(0, quantity);

          return {
            inventory: {
              ...state.inventory,
              [key]: {
                productId,
                colorId,
                sizeId,
                quantity: safeQty,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      // Converts API/Database Array into Map
      setAllInventory: (records) => {
        const dict: Record<string, Inventory> = {};
        for (const item of records) {
          const key = getInventoryKey(item.productId, item.colorId, item.sizeId);
          dict[key] = item;
        }
        set({ inventory: dict });
      },

      // Utility to export state back as an array for API payloads
      getInventoryArray: () => Object.values(get().inventory),

      getQuantity: (key) => get().inventory[key]?.quantity ?? 0,
    }),
    {
      name: 'global-inventory-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
