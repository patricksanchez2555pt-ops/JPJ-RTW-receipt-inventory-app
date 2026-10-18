import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { f } from '@/utils/fontScale';

import { useColorStore } from '../../../store/useColorStore';
import { useDeductionStore } from '../../../store/useDeductionStore';
import { useLaborItemStore } from '../../../store/useLaborItemStore';
import { useLaborRateStore } from '../../../store/useLaborRateStore';
import { useOperationStore } from '../../../store/useOperationStore';
import { useProductStore } from '../../../store/useProductStore';
import { useSizeStore } from '../../../store/useSizeStore';
import { useWorkerStore } from '../../../store/useWorkerStore';
import type { Deduction, LaborItem, Worker } from '../../../types/localModels';
import AddDeductionForm from './components/AddDeductionForm';
import AddLaborItemForm from './components/AddLaborItemForm';
import LaborEntriesList from './components/labor-entries/LaborEntriesList';
import WorkerDetailHeader from './components/WorkerDetailHeader';
import WorkerList from './components/WorkerList';

interface WorkerDirectoryViewProps {
  startDate: string;
  endDate: string;
}

interface GroupedColorEntry {
  colorId: string;
  colorName: string;
  colorHex: string;
  items: LaborItem[];
  colorTotalPieces: number;
  colorTotalEarned: number;
}

interface GroupedProductEntry {
  productId: string;
  productName: string;
  colors: GroupedColorEntry[];
  productTotalPieces: number;
  productTotalEarned: number;
}

interface GroupedDateEntry {
  date: string;
  formattedLabel: string;
  products: GroupedProductEntry[];
  dateTotalPieces: number;
  dateTotalEarned: number;
  deductions: Deduction[];
  dateTotalDeductions: number;
}

type PickerState = {
  itemId: string;
  type: 'operation' | 'size' | 'color';
  productId: string;
} | null;

type FormMode = 'none' | 'entry' | 'deduction';

const parseDateString = (dateStr: string): Date => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
  }
  return new Date(Number.NaN);
};

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}-${year}`;
};

const getFormattedDateLabel = (dateStr: string): string => {
  const dateObj = parseDateString(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  return `${dayName}, ${dateStr}`;
};

const getDatesInRange = (startStr: string, endStr: string): string[] => {
  const start = parseDateString(startStr);
  const end = parseDateString(endStr);
  const dates: string[] = [];

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDateToString(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const WorkerDirectoryView: React.FC<WorkerDirectoryViewProps> = ({ startDate, endDate }) => {
  const workers = useWorkerStore((state) => state.workers);
  const laborItems = useLaborItemStore((state) => state.laborItems);
  const addLaborItem = useLaborItemStore((state) => state.addLaborItem);
  const updateLaborItem = useLaborItemStore((state) => state.updateLaborItem);
  const deleteLaborItem = useLaborItemStore((state) => state.deleteLaborItem);

  const deductionsByDate = useDeductionStore((state) => state.deductions);
  const addDeduction = useDeductionStore((state) => state.addDeduction);
  const deleteDeduction = useDeductionStore((state) => state.deleteDeduction);

  const operations = useOperationStore((state) => state.operations);
  const products = useProductStore((state) => state.products);
  const sizes = useSizeStore((state) => state.sizes);
  const colors = useColorStore((state) => state.colors);
  const getLaborRate = useLaborRateStore((state) => state.getLaborRate);

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [activePicker, setActivePicker] = useState<PickerState>(null);
  const [formMode, setFormMode] = useState<FormMode>('none');

  const activeRangeDates = useMemo(() => getDatesInRange(startDate, endDate), [startDate, endDate]);
  const activeDateSet = useMemo(() => new Set(activeRangeDates), [activeRangeDates]);

  const allItems = useMemo(
    () =>
      Object.values(laborItems)
        .flatMap((workerItems) => Object.values(workerItems))
        .filter((item) => activeDateSet.has(item.date)),
    [laborItems, activeDateSet],
  );

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const operationById = useMemo(
    () => new Map(operations.map((operation) => [operation.id, operation])),
    [operations],
  );
  const sizeById = useMemo(() => new Map(sizes.map((size) => [size.id, size])), [sizes]);
  const colorById = useMemo(() => new Map(colors.map((color) => [color.id, color])), [colors]);

  const groupedWorkerEntries = useMemo((): GroupedDateEntry[] => {
    if (!selectedWorker) return [];

    const workerItems = allItems.filter((item) => item.workerId === selectedWorker.id);
    const dateMap = new Map<string, Map<string, Map<string, LaborItem[]>>>();

    workerItems.forEach((item) => {
      if (!dateMap.has(item.date)) dateMap.set(item.date, new Map());
      const productMap = dateMap.get(item.date)!;
      if (!productMap.has(item.productId)) productMap.set(item.productId, new Map());
      const colorMap = productMap.get(item.productId)!;
      const colorKey = item.colorId || 'default';
      if (!colorMap.has(colorKey)) colorMap.set(colorKey, []);
      colorMap.get(colorKey)!.push(item);
    });

    activeRangeDates.forEach((dateStr) => {
      const dateDeductionsObj = deductionsByDate[dateStr] || {};
      const hasWorkerDeduction = Object.values(dateDeductionsObj).some(
        (d) => d.workerId === selectedWorker.id,
      );
      if (hasWorkerDeduction && !dateMap.has(dateStr)) {
        dateMap.set(dateStr, new Map());
      }
    });

    const sortedDates = Array.from(dateMap.keys()).sort(
      (a, b) => parseDateString(b).getTime() - parseDateString(a).getTime(),
    );

    return sortedDates.map((date) => {
      const productMap = dateMap.get(date)!;
      let dateTotalPieces = 0;
      let dateTotalEarned = 0;

      const productEntries = Array.from(productMap.entries()).map(([productId, colorMap]) => {
        let productTotalPieces = 0;
        let productTotalEarned = 0;

        const colorEntries = Array.from(colorMap.entries()).map(([colorId, items]) => {
          const colorTotalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
          const colorTotalEarned = items.reduce((sum, item) => sum + item.subtotal, 0);
          productTotalPieces += colorTotalPieces;
          productTotalEarned += colorTotalEarned;

          const sortedItems = [...items].sort(
            (a, b) => (sizeById.get(a.sizeId)?.price ?? 0) - (sizeById.get(b.sizeId)?.price ?? 0),
          );

          const colorObj = colorById.get(colorId);

          return {
            colorId,
            colorName: colorObj?.name ?? 'Default Color',
            colorHex: colorObj?.hexValue ?? '#CCCCCC',
            items: sortedItems,
            colorTotalPieces,
            colorTotalEarned,
          };
        });

        dateTotalPieces += productTotalPieces;
        dateTotalEarned += productTotalEarned;

        return {
          productId,
          productName: productById.get(productId)?.name ?? 'Unknown Product',
          colors: colorEntries,
          productTotalPieces,
          productTotalEarned,
        };
      });

      const dateDeductionsMap = deductionsByDate[date] || {};
      const workerDeductions = Object.values(dateDeductionsMap).filter(
        (d) => d.workerId === selectedWorker.id,
      );
      const dateTotalDeductions = workerDeductions.reduce((sum, d) => sum + d.amount, 0);

      return {
        date,
        formattedLabel: getFormattedDateLabel(date),
        products: productEntries,
        dateTotalPieces,
        dateTotalEarned,
        deductions: workerDeductions,
        dateTotalDeductions,
      };
    });
  }, [
    allItems,
    selectedWorker,
    productById,
    sizeById,
    colorById,
    deductionsByDate,
    activeRangeDates,
  ]);

  const getTotals = (workerId: string) => {
    const items = allItems.filter((item) => item.workerId === workerId);
    const totalEarned = items.reduce((sum, item) => sum + item.subtotal, 0);

    let totalDeductions = 0;
    activeRangeDates.forEach((dateStr) => {
      const dateDeductionsObj = deductionsByDate[dateStr] || {};
      Object.values(dateDeductionsObj).forEach((d) => {
        if (d.workerId === workerId) {
          totalDeductions += d.amount;
        }
      });
    });

    return {
      totalPieces: items.reduce((sum, item) => sum + item.quantity, 0),
      totalEarned,
      totalDeductions,
      netTotal: totalEarned - totalDeductions,
    };
  };

  const handleAddLaborItemForProduct = (
    date: string,
    productId: string,
    sizeId: string,
    colorId: string,
  ) => {
    if (!selectedWorker) return;

    const productOperations = operations.filter((operation) => operation.productId === productId);
    const productSizes = sizes.filter((size) => size.productId === productId);
    const productColors = colors.filter((color) => color.productId === productId);

    if (!productOperations.length || !productSizes.length) return;

    const operationId = productOperations[0].id;
    const targetSizeId = sizeId || productSizes[0].id;
    const targetColorId = colorId || (productColors[0] ? productColors[0].id : '');
    const rate = getLaborRate(productId, targetSizeId, operationId);

    addLaborItem({
      productId,
      sizeId: targetSizeId,
      colorId: targetColorId,
      operationId,
      workerId: selectedWorker.id,
      date,
      quantity: 1,
      ratePerUnit: rate?.ratePerUnit ?? 0,
    });
  };

  const handleUpdateItemSelection = (
    item: LaborItem,
    type: 'operation' | 'size' | 'color',
    newId: string,
  ) => {
    const updates: Partial<LaborItem> = {};
    const newOperationId = type === 'operation' ? newId : item.operationId;
    const newSizeId = type === 'size' ? newId : item.sizeId;

    if (type === 'operation') updates.operationId = newId;
    else if (type === 'size') updates.sizeId = newId;
    else if (type === 'color') updates.colorId = newId;

    const rate = getLaborRate(item.productId, newSizeId, newOperationId);
    if (rate) updates.ratePerUnit = rate.ratePerUnit;

    updateLaborItem(item.id, updates);
    setActivePicker(null);
  };

  if (selectedWorker) {
    const workerTotals = getTotals(selectedWorker.id);
    const workerItems = allItems.filter((item) => item.workerId === selectedWorker.id);

    return (
      <View style={styles.container}>
        <WorkerDetailHeader
          worker={selectedWorker}
          startDate={startDate}
          endDate={endDate}
          totalPieces={workerTotals.totalPieces}
          totalEarned={workerTotals.totalEarned}
          totalDeductions={workerTotals.totalDeductions}
          netTotal={workerTotals.netTotal}
          onBack={() => {
            setSelectedWorker(null);
            setActivePicker(null);
            setFormMode('none');
          }}
        />

        {/* Section Header with Both Actions */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>Labor Breakdown</Text>
            <View style={styles.entryCount}>
              <Text style={styles.entryCountText}>{workerItems.length} entries</Text>
            </View>
          </View>

          <View style={styles.actionHeaderButtons}>
            <Pressable
              style={({ pressed }) => [styles.addDeductionHeaderBtn, pressed && styles.pressed]}
              onPress={() => setFormMode((prev) => (prev === 'deduction' ? 'none' : 'deduction'))}
            >
              <Ionicons
                name={formMode === 'deduction' ? 'close' : 'remove-circle-outline'}
                size={14}
                color="#DC2626"
              />
              <Text style={styles.addDeductionHeaderBtnText}>
                {formMode === 'deduction' ? 'Cancel' : 'Add Deduction'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.addGlobalEntryBtn, pressed && styles.pressed]}
              onPress={() => setFormMode((prev) => (prev === 'entry' ? 'none' : 'entry'))}
            >
              <Ionicons name={formMode === 'entry' ? 'close' : 'add'} size={14} color="#1745D1" />
              <Text style={styles.addGlobalEntryBtnText}>
                {formMode === 'entry' ? 'Cancel' : 'Add Entry'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Conditional Add Forms */}
        {formMode === 'entry' && (
          <AddLaborItemForm
            products={products}
            operations={operations}
            sizes={sizes}
            colors={colors}
            initialDate={activeRangeDates.length > 0 ? activeRangeDates[0] : startDate}
            workerId={selectedWorker.id}
            getLaborRate={getLaborRate}
            onSave={(entry) => {
              addLaborItem(entry);
              setFormMode('none');
            }}
            onCancel={() => setFormMode('none')}
          />
        )}

        {formMode === 'deduction' && (
          <AddDeductionForm
            workerId={selectedWorker.id}
            initialDate={activeRangeDates.length > 0 ? activeRangeDates[0] : startDate}
            onSave={(deduction) => {
              addDeduction(deduction);
              setFormMode('none');
            }}
            onCancel={() => setFormMode('none')}
          />
        )}

        <LaborEntriesList
          groups={groupedWorkerEntries}
          operations={operations}
          sizes={sizes}
          operationById={operationById}
          sizeById={sizeById}
          activePicker={activePicker}
          setActivePicker={setActivePicker}
          onAddEntry={(date, productId, colorId, sizeId) =>
            handleAddLaborItemForProduct(date, productId, sizeId, colorId)
          }
          onSelect={handleUpdateItemSelection}
          onQuantityChange={(itemId, quantity) => updateLaborItem(itemId, { quantity })}
          onDelete={deleteLaborItem}
          onAddDeduction={(deduction) => addDeduction(deduction)}
          onDeleteDeduction={(id, date) => deleteDeduction(id, date)}
          workerId={selectedWorker.id}
        />
      </View>
    );
  }

  return (
    <WorkerList
      workers={workers}
      getTotals={getTotals}
      startDate={startDate}
      endDate={endDate}
      onSelectWorker={(worker) => setSelectedWorker(worker)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  sectionHeader: {
    minHeight: 30,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: f(15),
    fontWeight: '700',
  },
  entryCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  entryCountText: {
    color: '#475569',
    fontSize: f(11),
    fontWeight: '700',
  },
  actionHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addDeductionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addDeductionHeaderBtnText: {
    color: '#DC2626',
    fontSize: f(11),
    fontWeight: '700',
  },
  addGlobalEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addGlobalEntryBtnText: {
    color: '#1745D1',
    fontSize: f(11),
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
