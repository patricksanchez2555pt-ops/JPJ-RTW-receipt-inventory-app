import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CustomerPrice } from '../types/localModels';

const storage = createMMKV({
  id: 'customer-pricing-storage',
});

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);

    return value ?? null;
  },

  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },

  removeItem: (name: string) => {
    storage.remove(name);
  },
};

type CustomerPricingStore = {
  customerPrices: CustomerPrice[];

  addCustomerPrice: (customerPrice: Omit<CustomerPrice, 'id' | 'updatedAt'>) => CustomerPrice;

  updateCustomerPrice: (id: string, updates: Partial<CustomerPrice>) => void;

  deleteCustomerPrice: (id: string) => void;

  getCustomerPrice: (
    customerId: string,
    productId: string,
    sizeId: string,
  ) => CustomerPrice | undefined;

  getCustomerPricesForCustomer: (customerId: string) => CustomerPrice[];

  getCustomerPricesForProduct: (customerId: string, productId: string) => CustomerPrice[];
};

export const useCustomerPricingStore = create<CustomerPricingStore>()(
  persist(
    (set, get) => ({
      customerPrices: [],

      addCustomerPrice: (customerPrice) => {
        const existing = get().getCustomerPrice(
          customerPrice.customerId,
          customerPrice.productId,
          customerPrice.sizeId,
        );

        /*
         * Prevent duplicate customer-price records.
         *
         * If one already exists, update it instead.
         */
        if (existing) {
          const updatedCustomerPrice: CustomerPrice = {
            ...existing,
            ...customerPrice,
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            customerPrices: state.customerPrices.map((price) =>
              price.id === existing.id ? updatedCustomerPrice : price,
            ),
          }));

          return updatedCustomerPrice;
        }

        const createdCustomerPrice: CustomerPrice = {
          ...customerPrice,
          id: `customer-price-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          customerPrices: [...state.customerPrices, createdCustomerPrice],
        }));

        return createdCustomerPrice;
      },

      updateCustomerPrice: (id, updates) =>
        set((state) => ({
          customerPrices: state.customerPrices.map((customerPrice) =>
            customerPrice.id === id
              ? {
                  ...customerPrice,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : customerPrice,
          ),
        })),

      deleteCustomerPrice: (id) =>
        set((state) => ({
          customerPrices: state.customerPrices.filter((customerPrice) => customerPrice.id !== id),
        })),

      getCustomerPrice: (customerId, productId, sizeId) =>
        get().customerPrices.find(
          (customerPrice) =>
            customerPrice.customerId === customerId &&
            customerPrice.productId === productId &&
            customerPrice.sizeId === sizeId,
        ),

      getCustomerPricesForCustomer: (customerId) =>
        get().customerPrices.filter((customerPrice) => customerPrice.customerId === customerId),

      getCustomerPricesForProduct: (customerId, productId) =>
        get().customerPrices.filter(
          (customerPrice) =>
            customerPrice.customerId === customerId && customerPrice.productId === productId,
        ),
    }),
    {
      name: 'customer-pricing',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
