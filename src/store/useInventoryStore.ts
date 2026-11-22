import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Inventory, InventoryLocation } from '../types/localModels';

const mmkv = createMMKV();

// Custom MMKV storage engine for Zustand persistence
const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name), // Use .remove() for MMKV v3+
};
// Store keeps the legacy key format so existing inventory remains available.
export const getInventoryKey = (
  productId: string,
  colorId: string,
  sizeId: string,
  location: InventoryLocation = 'store',
) => {
  const key = `${productId}:${colorId}:${sizeId}`;
  return location === 'store' ? key : `${key}:${location}`;
};

type InventoryStore = {
  // Keyed dictionary for O(1) reads and updates
  inventory: Record<string, Inventory>;

  // Actions
  setQuantity: (
    productId: string,
    colorId: string,
    sizeId: string,
    quantity: number,
    location?: InventoryLocation,
  ) => void;
  setAllInventory: (records: Inventory[]) => void;
  getInventoryArray: () => Inventory[];
  getQuantity: (key: string) => number;
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      inventory: {},

      // O(1) State Update
      setQuantity: (productId, colorId, sizeId, quantity, location = 'store') =>
        set((state) => {
          const key = getInventoryKey(productId, colorId, sizeId, location);
          const safeQty = Math.max(0, quantity);

          return {
            inventory: {
              ...state.inventory,
              [key]: {
                productId,
                colorId,
                sizeId,
                quantity: safeQty,
                location,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      // Converts API/Database Array into Map
      setAllInventory: (records) => {
        const dict: Record<string, Inventory> = {};
        for (const item of records) {
          const location = item.location ?? 'store';
          const key = getInventoryKey(item.productId, item.colorId, item.sizeId, location);
          dict[key] = { ...item, location };
        }
        set({ inventory: dict });
      },

      // Utility to export state back as an array for API payloads
      getInventoryArray: () =>
        Object.values(get().inventory).map((item) => ({
          ...item,
          location: item.location ?? 'store',
        })),

      getQuantity: (key) => get().inventory[key]?.quantity ?? 0,
    }),
    {
      name: 'global-inventory-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
