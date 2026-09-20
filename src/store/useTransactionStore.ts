import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Transaction, TransactionItem } from '../types/localModels';
import { getInventoryKey, useInventoryStore } from './useInventoryStore';

const mmkv = createMMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name),
};

type TransactionStore = {
  transactions: Transaction[];

  // Actions
  addTransaction: (
    transactionData: Omit<Transaction, 'id' | 'date'> & { date?: string },
  ) => Transaction;
  updateTransaction: (transactionData: Transaction) => Transaction | undefined;
  deleteTransaction: (id: string) => void;
  setAllTransactions: (transactions: Transaction[]) => void;

  // Getters
  getAllTransactions: () => Transaction[];
  getTransactionById: (id: string) => Transaction | undefined;
};

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      /**
       * Creates a transaction AND automatically deducts sold items from Inventory.
       */
      addTransaction: (data) => {
        const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const date = data.date ?? new Date().toISOString();

        // Calculate subtotal & total if not provided
        const items = (data.items ?? []).map((item) => ({
          ...item,
          transactionId,
        }));
        const subtotal = data.subtotal ?? items.reduce((sum, item) => sum + item.total, 0);
        const discount = data.discount ?? 0;
        const total = data.total ?? Math.max(0, subtotal - discount);

        const newTransaction: Transaction = {
          ...data,
          id: transactionId,
          date,
          subtotal,
          discount,
          total,
          items,
        };

        // 1. DEDUCT SOLD QUANTITIES FROM GLOBAL INVENTORY STORE
        const inventoryStore = useInventoryStore.getState();
        items.forEach((item: TransactionItem) => {
          const key = getInventoryKey(item.productId, item.colorId, item.sizeId);

          const currentQty = inventoryStore.getQuantity(key);
          const updatedQty = Math.max(0, currentQty - item.quantity);

          inventoryStore.setQuantity(item.productId, item.colorId, item.sizeId, updatedQty);
        });

        // 2. SAVE TRANSACTION LOCALLY (Latest transactions first)
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));

        return newTransaction;
      },

      updateTransaction: (data) => {
        const updatedTransaction = get().transactions.find((t) => t.id === data?.id);
        Object.keys(data)?.forEach((k) => {
          updatedTransaction[k] = data[k];
        });
        return updatedTransaction;
      },

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setAllTransactions: (transactions) => set({ transactions }),

      getAllTransactions: () => get().transactions,

      getTransactionById: (id) => get().transactions.find((t) => t.id === id),
    }),
    {
      name: 'global-transaction-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
