import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Worker } from '../types/localModels';

const storage = createMMKV({ id: 'worker-storage' });

type NewWorker = Omit<Worker, 'id' | 'createdAt' | 'defaultOperations'> & {
  defaultOperations?: string[];
};

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

type WorkerStore = {
  workers: Worker[];
  addWorker: (worker: NewWorker) => Worker;
  updateWorker: (
    id: string,
    updates: Partial<Pick<Worker, 'name' | 'phone' | 'defaultOperations'>>,
  ) => void;
  deleteWorker: (id: string) => void;
  setAllWorkers: (workers: Worker[]) => void;
  getAllWorkers: () => Worker[];
  getWorkerById: (id: string) => Worker | undefined;
  getWorkersByDefaultOperationId: (operationId: string) => Worker[];
};

export const useWorkerStore = create<WorkerStore>()(
  persist(
    (set, get) => ({
      workers: [],

      addWorker: (worker) => {
        const createdWorker: Worker = {
          ...worker,
          id: `worker-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          defaultOperations: worker.defaultOperations ?? [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ workers: [...state.workers, createdWorker] }));
        return createdWorker;
      },

      updateWorker: (id, updates) =>
        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.id === id ? { ...worker, ...updates } : worker,
          ),
        })),

      deleteWorker: (id) =>
        set((state) => ({ workers: state.workers.filter((worker) => worker.id !== id) })),

      setAllWorkers: (workers) =>
        set({
          workers: workers.map((worker) => ({
            ...worker,
            defaultOperations: worker.defaultOperations ?? [],
          })),
        }),
      getAllWorkers: () => get().workers,
      getWorkerById: (id) => get().workers.find((worker) => worker.id === id),
      getWorkersByDefaultOperationId: (operationId) =>
        get().workers.filter((worker) => worker.defaultOperations.includes(operationId)),
    }),
    {
      name: 'workers',
      storage: createJSONStorage(() => mmkvStorage),
      merge: (persistedState, currentState) => {
        const persistedWorkers = (persistedState as Partial<WorkerStore>).workers;

        return {
          ...currentState,
          ...(persistedState as Partial<WorkerStore>),
          workers: (persistedWorkers ?? currentState.workers).map((worker) => ({
            ...worker,
            defaultOperations: worker.defaultOperations ?? [],
          })),
        };
      },
    },
  ),
);
