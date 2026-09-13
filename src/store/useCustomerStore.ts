import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Customer } from '../types/localModels';
import { useCustomerPricingStore } from './useCustomerPricingStore';

const storage = createMMKV({
  id: 'customer-storage',
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

type CustomerStore = {
  customers: Customer[];

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;

  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  deleteCustomer: (id: string) => void;

  getCustomer: (id: string) => Customer | undefined;
};

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customers: [],

      addCustomer: (customer) => {
        const createdCustomer: Customer = {
          ...customer,
          id: `customer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          customers: [...state.customers, createdCustomer],
        }));

        return createdCustomer;
      },

      updateCustomer: (id, updates) =>
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id
              ? {
                  ...customer,
                  ...updates,
                }
              : customer,
          ),
        })),

      deleteCustomer: (id) => {
        /*
         * Delete all customer-specific pricing
         * associated with this customer.
         */
        const customerPricingStore = useCustomerPricingStore.getState();

        const customerPrices = customerPricingStore.getCustomerPricesForCustomer(id);

        customerPrices.forEach((price) => {
          customerPricingStore.deleteCustomerPrice(price.id);
        });

        /*
         * Delete the customer itself.
         */
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
        }));
      },

      getCustomer: (id) => get().customers.find((customer) => customer.id === id),
    }),
    {
      name: 'customers',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
