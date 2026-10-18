import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Deduction } from '@/types/localModels'; // Adjust path as needed

type DeductionState = {
  deductions: Record<string, Record<string, Deduction>>; // Nested record: date (MM-DD-YYYY) -> deductionId -> Deduction
  addDeduction: (deduction: Omit<Deduction, 'id' | 'createdAt'>) => void;
  updateDeduction: (id: string, date: string, updates: Partial<Deduction>) => void;
  deleteDeduction: (id: string, date: string) => void;
  getWorkerDeductions: (workerId: string) => Deduction[];
};

export const useDeductionStore = create<DeductionState>()(
  persist(
    (set, get) => ({
      deductions: {},

      addDeduction: (deductionData) => {
        const id = `ded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date().toISOString();
        const newDeduction: Deduction = {
          ...deductionData,
          id,
          createdAt,
        };

        const dateKey = deductionData.date; // Expected to be in MM-DD-YYYY format

        set((state) => {
          const dateGroup = state.deductions[dateKey] || {};
          return {
            deductions: {
              ...state.deductions,
              [dateKey]: {
                ...dateGroup,
                [id]: newDeduction,
              },
            },
          };
        });
      },

      updateDeduction: (id, date, updates) => {
        set((state) => {
          const dateGroup = state.deductions[date];
          if (!dateGroup || !dateGroup[id]) return state;

          const existing = dateGroup[id];
          const updatedDeduction = { ...existing, ...updates };
          const newDateKey = updatedDeduction.date;

          // If the date changed, move it to the new date group key
          if (newDateKey && newDateKey !== date) {
            const { [id]: _, ...remainingOldDateGroup } = dateGroup;
            const newDateGroup = state.deductions[newDateKey] || {};

            return {
              deductions: {
                ...state.deductions,
                [date]: remainingOldDateGroup,
                [newDateKey]: {
                  ...newDateGroup,
                  [id]: updatedDeduction,
                },
              },
            };
          }

          // Otherwise, update within the same date group
          return {
            deductions: {
              ...state.deductions,
              [date]: {
                ...dateGroup,
                [id]: updatedDeduction,
              },
            },
          };
        });
      },

      deleteDeduction: (id, date) => {
        set((state) => {
          const dateGroup = state.deductions[date];
          if (!dateGroup) return state;

          const { [id]: _, ...remainingGroup } = dateGroup;

          const updatedDeductions = { ...state.deductions };
          if (Object.keys(remainingGroup).length === 0) {
            delete updatedDeductions[date];
          } else {
            updatedDeductions[date] = remainingGroup;
          }

          return { deductions: updatedDeductions };
        });
      },

      getWorkerDeductions: (workerId) => {
        const allDateGroups = Object.values(get().deductions);
        const workerDeductions: Deduction[] = [];

        allDateGroups.forEach((dateGroup) => {
          Object.values(dateGroup).forEach((deduction) => {
            if (deduction.workerId === workerId) {
              workerDeductions.push(deduction);
            }
          });
        });

        return workerDeductions;
      },
    }),
    {
      name: 'deduction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
