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

type InventoryStore = {
  inventory: Inventory[];

  // Setters
  setQuantity: (productId: string, colorId: string, sizeId: string, quantity: number) => void;
  setAllInventory: (records: Inventory[]) => void;

  // Getters
  getQuantity: (productId: string, colorId: string, sizeId: string) => number;
  getMapByProductId: (productId: string) => Record<string, number>;
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      inventory: [],

      /**
       * Updates quantity for a specific product, color, and size.
       * Automatically persists to disk and updates reactive state across the app.
       */
      setQuantity: (productId, colorId, sizeId, quantity) =>
        set((state) => {
          const safeQty = Math.max(0, quantity);
          const index = state.inventory.findIndex(
            (item) =>
              item.productId === productId && item.colorId === colorId && item.sizeId === sizeId,
          );

          const updatedAt = new Date().toISOString();

          if (index >= 0) {
            const updated = [...state.inventory];
            updated[index] = { ...updated[index], quantity: safeQty, updatedAt };
            return { inventory: updated };
          }

          return {
            inventory: [
              ...state.inventory,
              { productId, colorId, sizeId, quantity: safeQty, updatedAt },
            ],
          };
        }),

      /**
       * Bulk replaces or initializes the inventory array.
       */
      setAllInventory: (records) => set({ inventory: records }),

      /**
       * Retrieves quantity for a specific productId, colorId, and sizeId.
       */
      getQuantity: (productId, colorId, sizeId) => {
        const match = get().inventory.find(
          (item) =>
            item.productId === productId && item.colorId === colorId && item.sizeId === sizeId,
        );
        return match ? match.quantity : 0;
      },

      /**
       * Returns a lookup map keyed by `${sizeId}-${colorId}` for fast O(1) rendering in tables.
       */
      getMapByProductId: (productId) => {
        const productItems = get().inventory.filter((item) => item.productId === productId);

        const map: Record<string, number> = {};
        for (const item of productItems) {
          map[`${item.sizeId}-${item.colorId}`] = item.quantity;
        }
        return map;
      },
    }),
    {
      name: 'global-inventory-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
