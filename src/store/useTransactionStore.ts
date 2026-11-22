import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// import { supabase } from '@/lib/supabase';
import type { Transaction, TransactionItem } from '../types/localModels';
import { getInventoryKey, useInventoryStore } from './useInventoryStore';

const mmkv = createMMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.remove(name),
};

type InventoryQuantity = {
  productId: string;
  colorId: string;
  sizeId: string;
  quantity: number;
};

function getTransactionInventoryQuantities(items: TransactionItem[] = []) {
  const quantities = new Map<string, InventoryQuantity>();

  const addQuantity = (productId: string, colorId: string, sizeId: string, quantity: number) => {
    const key = getInventoryKey(productId, colorId, sizeId);
    const existing = quantities.get(key);

    quantities.set(key, {
      productId,
      colorId,
      sizeId,
      quantity: (existing?.quantity ?? 0) + quantity,
    });
  };

  items.forEach((item) => {
    if (item.productId === 'leotard-set-long' || item.productId === 'leotard-set-short') {
      const topProductId = item.productId.replace('-set', '');
      const topColorId = item.colorId.replace('-set', '');
      const topSizeId = item.sizeId.replace('-set', '');

      addQuantity(topProductId, topColorId, topSizeId, item.quantity);

      const bottomColorId = item.colorId
        .replace('leotard-set-long', 'tights-sakbet')
        .replace('leotard-set-short', 'tights-sakbet');
      const bottomSizeId = item.sizeId
        .replace('leotard-set-long', 'tights-sakbet')
        .replace('leotard-set-short', 'tights-sakbet');

      addQuantity('tights-sakbet', bottomColorId, bottomSizeId, item.quantity);
      return;
    }

    addQuantity(item.productId, item.colorId, item.sizeId, item.quantity);
  });

  return quantities;
}

function updateInventoryForTransactionChange(
  previousItems: TransactionItem[] = [],
  nextItems: TransactionItem[] = [],
) {
  const previousQuantities = getTransactionInventoryQuantities(previousItems);
  const nextQuantities = getTransactionInventoryQuantities(nextItems);
  const inventoryStore = useInventoryStore.getState();

  for (const [key, previous] of previousQuantities) {
    const next = nextQuantities.get(key);
    const quantityChange = previous.quantity - (next?.quantity ?? 0);

    if (quantityChange !== 0) {
      const currentQty = inventoryStore.getQuantity(key);
      inventoryStore.setQuantity(
        previous.productId,
        previous.colorId,
        previous.sizeId,
        Math.max(0, currentQty + quantityChange),
      );
    }
  }

  for (const [key, next] of nextQuantities) {
    if (previousQuantities.has(key)) {
      continue;
    }

    const currentQty = inventoryStore.getQuantity(key);
    inventoryStore.setQuantity(
      next.productId,
      next.colorId,
      next.sizeId,
      Math.max(0, currentQty - next.quantity),
    );
  }
}

type TransactionStore = {
  transactions: Transaction[];

  // Actions
  addTransaction: (
    transactionData: Omit<Transaction, 'id' | 'date' | 'createdBy'> & { date?: string },
  ) => Promise<Transaction | null>;
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
      addTransaction: async (data) => {
        // const session = (await supabase.auth.getSession())?.data?.session;
        // const userId = session?.user?.id;

        // console.log('-----');
        // console.log(userId);

        // if (!userId) return null;

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
          // createdBy: userId,
        };

        updateInventoryForTransactionChange([], items);

        // 2. SAVE TRANSACTION LOCALLY (Latest transactions first)
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));

        return newTransaction;
      },

      updateTransaction: (data) => {
        const previousTransaction = get().transactions.find((t) => t.id === data?.id);
        if (!previousTransaction) return undefined;

        const updatedTransaction = { ...previousTransaction, ...data };
        updateInventoryForTransactionChange(previousTransaction.items, updatedTransaction.items);

        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === data.id ? updatedTransaction : t)),
        }));

        return updatedTransaction;
      },

      deleteTransaction: (id) => {
        const transaction = get().transactions.find((t) => t.id === id);
        if (!transaction) {
          return;
        }

        updateInventoryForTransactionChange(transaction.items, []);

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

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
