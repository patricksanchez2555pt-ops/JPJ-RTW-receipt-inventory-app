import React, { useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ProductSelector from '@/components/common/ProductSelector';
import { f } from '@/utils/fontScale';

import { getLaborItemKey, useLaborItemStore } from '../../store/useLaborItemStore';
import { useLaborRateStore } from '../../store/useLaborRateStore';
import { useOperationStore } from '../../store/useOperationStore';
import { useProductStore } from '../../store/useProductStore';
import { useSizeStore } from '../../store/useSizeStore';
import { useWorkerStore } from '../../store/useWorkerStore';

interface LaborMatrixTableProps {
  startDate: string; // MM-DD-YYYY format
  endDate: string; // MM-DD-YYYY format
}

const SIZE_COLUMN_WIDTH = 100;
const ROW_HEIGHT = 70;
const HEADER_HEIGHT = 88;
const WORKER_COLUMN_WIDTH = 110;
const TOTAL_COLUMN_WIDTH = 68;
const STATUS_COLUMN_WIDTH = 100;

type WorkerAssignmentOverrides = {
  scope: string;
  added: Record<string, string[]>;
  hidden: Record<string, string[]>;
};

const parseDateString = (dateStr: string): Date | null => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateStr);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
};

// Helper to convert Date object back to MM-DD-YYYY string
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}-${year}`;
};

// Helper to generate all date strings (MM-DD-YYYY) inclusive between start and end
const getDatesInRange = (startStr: string, endStr: string): string[] => {
  const start = parseDateString(startStr);
  const end = parseDateString(endStr);
  if (!start || !end || start > end) return [];

  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDateToString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const LaborMatrixTable: React.FC<LaborMatrixTableProps> = ({ startDate, endDate }) => {
  const PRODUCTS = useProductStore((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0] ?? null);

  const productId = selectedProduct?.id ?? '';

  const OPERATIONS = useOperationStore((state) => state.operations);
  const operations = useMemo(
    () => OPERATIONS.filter((operation) => operation.productId === productId),
    [OPERATIONS, productId],
  );

  const SIZES = useSizeStore((state) => state.sizes);
  const sizes = useMemo(
    () => SIZES.filter((size) => size.productId === productId),
    [SIZES, productId],
  );

  const WORKERS = useWorkerStore((state) => state.workers);

  const laborItems = useLaborItemStore((state) => state.laborItems);

  const addLaborItem = useLaborItemStore((state) => state.addLaborItem);
  const updateLaborItem = useLaborItemStore((state) => state.updateLaborItem);
  const deleteLaborItem = useLaborItemStore((state) => state.deleteLaborItem);
  const getLaborRate = useLaborRateStore((state) => state.getLaborRate);

  // Check if the range is strictly a single day
  const isSingleDay = startDate === endDate && parseDateString(startDate) !== null;

  // Get all date keys falling within the range
  const activeRangeDates = useMemo(() => getDatesInRange(startDate, endDate), [startDate, endDate]);

  const assignmentScope = `${productId}|${startDate}|${endDate}|${operations
    .map((operation) => operation.id)
    .join(',')}`;

  const [assignmentOverrides, setAssignmentOverrides] = useState<WorkerAssignmentOverrides>({
    scope: '',
    added: {},
    hidden: {},
  });

  // Base assignments combine worker defaults with anyone who has logged work in this range.
  const defaultAssignedWorkers = useMemo(() => {
    const result: Record<string, string[]> = {};

    operations.forEach((operation) => {
      const workerIdsSet = new Set<string>();

      // 1. Include workers who have this operation in their defaultOperations
      WORKERS.forEach((worker) => {
        if (worker.defaultOperations?.includes(operation.id)) {
          workerIdsSet.add(worker.id);
        }
      });

      // 2. Include workers who have logged labor items for this operation across any date in the active range
      activeRangeDates.forEach((dateStr) => {
        sizes.forEach((size) => {
          const key = getLaborItemKey(productId, size.id, operation.id, dateStr);
          const workerRecords = laborItems[key];
          if (workerRecords) {
            Object.keys(workerRecords).forEach((workerId) => {
              workerIdsSet.add(workerId);
            });
          }
        });
      });

      result[operation.id] = Array.from(workerIdsSet);
    });

    return result;
  }, [operations, WORKERS, activeRangeDates, sizes, productId, laborItems]);

  const assignedWorkers = useMemo(() => {
    const isCurrentScope = assignmentOverrides.scope === assignmentScope;
    const result: Record<string, string[]> = {};

    operations.forEach((operation) => {
      const workerIds = new Set(defaultAssignedWorkers[operation.id] ?? []);
      const added = isCurrentScope ? (assignmentOverrides.added[operation.id] ?? []) : [];
      const hidden = new Set(
        isCurrentScope ? (assignmentOverrides.hidden[operation.id] ?? []) : [],
      );

      added.forEach((workerId) => workerIds.add(workerId));
      hidden.forEach((workerId) => workerIds.delete(workerId));
      result[operation.id] = Array.from(workerIds);
    });

    return result;
  }, [operations, defaultAssignedWorkers, assignmentOverrides, assignmentScope]);

  const [activeWorkerPickerOp, setActiveWorkerPickerOp] = useState<string | null>(null);

  const sizeColumnRef = useRef<ScrollView>(null);
  const laborRowsRef = useRef<ScrollView>(null);
  const syncingVertical = useRef(false);

  const handleLaborRowsScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (syncingVertical.current) return;

    syncingVertical.current = true;
    sizeColumnRef.current?.scrollTo({ y: event.nativeEvent.contentOffset.y, animated: false });
    requestAnimationFrame(() => {
      syncingVertical.current = false;
    });
  };

  const handleSizeColumnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (syncingVertical.current) return;

    syncingVertical.current = true;
    laborRowsRef.current?.scrollTo({ y: event.nativeEvent.contentOffset.y, animated: false });
    requestAnimationFrame(() => {
      syncingVertical.current = false;
    });
  };

  const handleAssignWorker = (operationId: string, workerId: string) => {
    if (!isSingleDay) return;

    setAssignmentOverrides((current) => {
      const scoped =
        current.scope === assignmentScope
          ? current
          : { scope: assignmentScope, added: {}, hidden: {} };
      const added = scoped.added[operationId] ?? [];

      return {
        ...scoped,
        added: {
          ...scoped.added,
          [operationId]: added.includes(workerId) ? added : [...added, workerId],
        },
        hidden: {
          ...scoped.hidden,
          [operationId]: (scoped.hidden[operationId] ?? []).filter((id) => id !== workerId),
        },
      };
    });

    setActiveWorkerPickerOp(null);
  };

  const handleRemoveWorker = (operationId: string, workerId: string) => {
    if (!isSingleDay) return;

    setAssignmentOverrides((current) => {
      const scoped =
        current.scope === assignmentScope
          ? current
          : { scope: assignmentScope, added: {}, hidden: {} };
      const hidden = scoped.hidden[operationId] ?? [];

      return {
        ...scoped,
        added: {
          ...scoped.added,
          [operationId]: (scoped.added[operationId] ?? []).filter((id) => id !== workerId),
        },
        hidden: {
          ...scoped.hidden,
          [operationId]: hidden.includes(workerId) ? hidden : [...hidden, workerId],
        },
      };
    });
  };

  // Compute total quantity across the entire date range for a given cell
  const getAggregatedQuantity = (sizeId: string, operationId: string, workerId: string): number => {
    if (!productId) return 0;
    return activeRangeDates.reduce((sum, dateStr) => {
      const key = getLaborItemKey(productId, sizeId, operationId, dateStr);
      return sum + (laborItems[key]?.[workerId]?.quantity ?? 0);
    }, 0);
  };

  // Handle updates (only active when isSingleDay is true)
  const handleQuantityChange = (
    sizeId: string,
    operationId: string,
    workerId: string,
    newTotalQty: number,
  ) => {
    if (!productId || !isSingleDay) return;

    const targetDate = startDate;
    const key = getLaborItemKey(productId, sizeId, operationId, targetDate);
    const existing = laborItems[key]?.[workerId];

    if (newTotalQty <= 0) {
      if (existing) deleteLaborItem(existing.id);
      return;
    }

    const rateObj = getLaborRate(productId, sizeId, operationId);
    const ratePerUnit = rateObj ? rateObj.ratePerUnit : 0;

    if (existing) {
      updateLaborItem(existing.id, { quantity: newTotalQty, ratePerUnit });
    } else {
      addLaborItem({
        productId,
        sizeId,
        operationId,
        workerId,
        date: targetDate,
        quantity: newTotalQty,
        ratePerUnit,
      });
    }
  };

  const getOpTotalForSize = (sizeId: string, operationId: string): number => {
    if (!productId) return 0;
    const opWorkers = assignedWorkers[operationId] ?? [];
    return opWorkers.reduce((acc, workerId) => {
      return acc + getAggregatedQuantity(sizeId, operationId, workerId);
    }, 0);
  };

  return (
    <View style={styles.container}>
      {/* Product Selector Bar */}
      <View style={styles.selectorWrapper}>
        <ProductSelector
          products={PRODUCTS}
          selectedProduct={selectedProduct}
          onSelect={(product) => {
            setSelectedProduct(product);
            setActiveWorkerPickerOp(null);
          }}
        />
      </View>

      {selectedProduct ? (
        <View style={styles.tableContainer}>
          <View style={styles.cornerCell}>
            <Text style={styles.headerText}>Size</Text>
          </View>

          <View style={styles.tableContent}>
            <ScrollView horizontal showsHorizontalScrollIndicator bounces={false}>
              <View>
                <View style={styles.headerRow}>
                  <View style={styles.sizeSpacer} />

                  {operations.map((op) => {
                    const opWorkers = assignedWorkers[op.id] ?? [];
                    const groupWidth = opWorkers.length * WORKER_COLUMN_WIDTH + TOTAL_COLUMN_WIDTH;

                    return (
                      <View key={op.id} style={[styles.opGroupHeader, { width: groupWidth }]}>
                        <View style={styles.opTitleBar}>
                          <Text style={styles.opTitleText} numberOfLines={1}>
                            {op.name}
                          </Text>
                          {isSingleDay && (
                            <TouchableOpacity
                              style={styles.addWorkerBtn}
                              onPress={() =>
                                setActiveWorkerPickerOp(
                                  activeWorkerPickerOp === op.id ? null : op.id,
                                )
                              }
                            >
                              <Text style={styles.addWorkerBtnText}>+ Worker</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {activeWorkerPickerOp === op.id && (
                          <View style={styles.workerDropdown}>
                            {WORKERS.filter((worker) => !opWorkers.includes(worker.id)).map(
                              (worker) => (
                                <TouchableOpacity
                                  key={worker.id}
                                  style={styles.dropdownItem}
                                  onPress={() => handleAssignWorker(op.id, worker.id)}
                                >
                                  <Text style={styles.dropdownItemText}>{worker.name}</Text>
                                </TouchableOpacity>
                              ),
                            )}
                          </View>
                        )}

                        <View style={styles.subHeaderRow}>
                          {opWorkers.map((workerId) => {
                            const worker = WORKERS.find((entry) => entry.id === workerId);

                            return (
                              <View key={workerId} style={styles.workerSubHeaderCell}>
                                <Text style={styles.workerNameText} numberOfLines={1}>
                                  {worker?.name ?? 'Worker'}
                                </Text>
                                {isSingleDay && (
                                  <TouchableOpacity
                                    onPress={() => handleRemoveWorker(op.id, workerId)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                  >
                                    <Text style={styles.removeWorkerText}>×</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                          <View style={[styles.workerSubHeaderCell, styles.totalSubHeader]}>
                            <Text style={styles.totalHeaderText}>Total</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  <View style={[styles.headerCell, styles.statusColumn]}>
                    <Text style={styles.headerText}>Status</Text>
                  </View>
                </View>

                <View style={styles.bodyContainer}>
                  <ScrollView
                    ref={laborRowsRef}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    bounces={false}
                    onScroll={handleLaborRowsScroll}
                    scrollEventThrottle={16}
                  >
                    {sizes.map((size) => {
                      const opTotals = operations.map((op) => getOpTotalForSize(size.id, op.id));
                      const isReconciled =
                        opTotals.length > 0 && opTotals.every((value) => value === opTotals[0]);

                      return (
                        <View
                          key={size.id}
                          style={[styles.dataRow, !isReconciled && styles.mismatchRow]}
                        >
                          <View style={styles.sizeSpacer} />

                          {operations.map((op, opIndex) => {
                            const opWorkers = assignedWorkers[op.id] ?? [];
                            const groupTotal = opTotals[opIndex];

                            return (
                              <View key={op.id} style={styles.opGroupCells}>
                                {opWorkers.map((workerId) => {
                                  const qty = getAggregatedQuantity(size.id, op.id, workerId);

                                  return (
                                    <View key={workerId} style={styles.inputOnlyCell}>
                                      <TextInput
                                        style={[
                                          styles.quantityInput,
                                          !isSingleDay && styles.disabledInput,
                                        ]}
                                        keyboardType="number-pad"
                                        selectTextOnFocus={isSingleDay}
                                        editable={isSingleDay}
                                        value={String(qty)}
                                        onChangeText={(value) => {
                                          if (!isSingleDay) return;
                                          const parsed = parseInt(value, 10);
                                          handleQuantityChange(
                                            size.id,
                                            op.id,
                                            workerId,
                                            Number.isNaN(parsed) ? 0 : parsed,
                                          );
                                        }}
                                      />
                                    </View>
                                  );
                                })}

                                <View style={[styles.cell, styles.opTotalCell]}>
                                  <Text style={styles.opTotalText}>{groupTotal}</Text>
                                </View>
                              </View>
                            );
                          })}

                          <View style={[styles.cell, styles.statusColumn]}>
                            <View
                              style={[
                                styles.statusBadge,
                                isReconciled ? styles.badgeSuccess : styles.badgeError,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgeText,
                                  isReconciled ? styles.badgeTextSuccess : styles.badgeTextError,
                                ]}
                              >
                                {isReconciled ? 'MATCH' : 'MISMATCH'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </ScrollView>
          </View>

          <View style={styles.sizeColumnContainer}>
            <ScrollView
              ref={sizeColumnRef}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onScroll={handleSizeColumnScroll}
              scrollEventThrottle={16}
            >
              {sizes.map((size) => {
                const opTotals = operations.map((op) => getOpTotalForSize(size.id, op.id));
                const isReconciled =
                  opTotals.length > 0 && opTotals.every((value) => value === opTotals[0]);

                return (
                  <View
                    key={size.id}
                    style={[styles.sizeCell, !isReconciled && styles.mismatchSizeCell]}
                  >
                    <Text style={styles.sizeText}>{size.name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please select a product to view labor matrices.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  selectorWrapper: {
    marginBottom: 16,
    zIndex: 100,
  },
  tableContainer: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  tableContent: {
    ...StyleSheet.absoluteFill,
  },
  cornerCell: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
    width: SIZE_COLUMN_WIDTH,
    height: HEADER_HEIGHT,
    backgroundColor: '#F3F5F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },
  headerRow: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    backgroundColor: '#F3F5F8',
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },
  sizeSpacer: { width: SIZE_COLUMN_WIDTH, height: '100%' },
  headerCell: { justifyContent: 'center', alignItems: 'center' },
  headerText: { color: '#06132F', fontWeight: '700', fontSize: f(15) },
  opGroupHeader: {
    height: HEADER_HEIGHT,
    borderRightWidth: 1,
    borderColor: '#D9DEE8',
    position: 'relative',
  },
  opTitleBar: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#06132F',
  },
  opTitleText: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: f(13),
    marginRight: 8,
  },
  addWorkerBtn: {
    backgroundColor: '#1745D1',
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addWorkerBtnText: { color: '#FFFFFF', fontSize: f(11), fontWeight: '600' },
  workerDropdown: {
    position: 'absolute',
    top: 38,
    right: 8,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 30,
  },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEF0F3' },
  dropdownItemText: { color: '#151A23', fontSize: f(12) },
  subHeaderRow: {
    height: HEADER_HEIGHT - 40,
    flexDirection: 'row',
    backgroundColor: '#F3F5F8',
  },
  workerSubHeaderCell: {
    width: WORKER_COLUMN_WIDTH,
    height: HEADER_HEIGHT - 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#D9DEE8',
  },
  totalSubHeader: {
    width: TOTAL_COLUMN_WIDTH,
    backgroundColor: '#E9EDF4',
    justifyContent: 'center',
  },
  workerNameText: { color: '#252B35', fontSize: f(11), fontWeight: '600', maxWidth: 68 },
  removeWorkerText: { color: '#DC2626', fontWeight: 'bold', fontSize: f(16) },
  totalHeaderText: { color: '#596273', fontSize: f(11), fontWeight: '700' },
  statusColumn: {
    width: STATUS_COLUMN_WIDTH,
    height: '100%',
    backgroundColor: '#F3F5F8',
    borderLeftWidth: 1,
    borderColor: '#D9DEE8',
  },
  bodyContainer: { height: '100%' },
  dataRow: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  mismatchRow: {
    backgroundColor: '#FEF2F2',
  },
  sizeColumnContainer: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    bottom: 0,
    width: SIZE_COLUMN_WIDTH,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
  },
  sizeCell: {
    width: SIZE_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },
  mismatchSizeCell: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  sizeText: { fontWeight: '600', color: '#06132F', fontSize: f(16) },
  cell: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },
  opGroupCells: { flexDirection: 'row' },
  inputOnlyCell: {
    width: WORKER_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DEE8',
  },
  quantityInput: {
    width: 72,
    height: 40,
    textAlign: 'center',
    fontSize: f(16),
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#CBD2DE',
    borderRadius: 6,
    color: '#06132F',
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F3F5F8',
    color: '#687284',
    borderColor: '#E9EDF4',
  },
  opTotalCell: {
    width: TOTAL_COLUMN_WIDTH,
    backgroundColor: '#F3F5F8',
    borderRightWidth: 1,
    borderColor: '#D9DEE8',
  },
  opTotalText: { fontWeight: '700', color: '#252B35', fontSize: f(15) },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  badgeSuccess: { backgroundColor: '#E8F5EC' },
  badgeError: { backgroundColor: '#FDECEC' },
  badgeText: { fontSize: f(10), fontWeight: '800' },
  badgeTextSuccess: { color: '#087F23' },
  badgeTextError: { color: '#B42318' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#687284',
    fontSize: f(15),
    fontWeight: '500',
  },
});
