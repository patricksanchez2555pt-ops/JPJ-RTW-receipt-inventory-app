import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Operation } from '../types/localModels';

const storage = createMMKV({ id: 'operation-storage' });

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

type OperationStore = {
  operations: Operation[];
  addOperation: (operation: Omit<Operation, 'id' | 'createdAt'>) => Operation;
  updateOperation: (
    id: string,
    updates: Partial<Pick<Operation, 'productId' | 'name' | 'description'>>,
  ) => void;
  deleteOperation: (id: string) => void;
  setAllOperations: (operations: Operation[]) => void;
  getAllOperations: () => Operation[];
  getOperationById: (id: string) => Operation | undefined;
  getOperationsByProductId: (productId: string) => Operation[];
};

export const useOperationStore = create<OperationStore>()(
  persist(
    (set, get) => ({
      operations: [],

      addOperation: (operation) => {
        const createdOperation: Operation = {
          ...operation,
          id: `operation-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ operations: [...state.operations, createdOperation] }));
        return createdOperation;
      },

      updateOperation: (id, updates) =>
        set((state) => ({
          operations: state.operations.map((operation) =>
            operation.id === id ? { ...operation, ...updates } : operation,
          ),
        })),

      deleteOperation: (id) =>
        set((state) => ({
          operations: state.operations.filter((operation) => operation.id !== id),
        })),

      setAllOperations: (operations) => set({ operations }),
      getAllOperations: () => get().operations,
      getOperationById: (id) => get().operations.find((operation) => operation.id === id),
      getOperationsByProductId: (productId) =>
        get().operations.filter((operation) => operation.productId === productId),
    }),
    {
      name: 'operations',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
