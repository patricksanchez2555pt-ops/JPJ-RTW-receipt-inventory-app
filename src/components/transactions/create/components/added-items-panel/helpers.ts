import type { AddedTransactionItem } from '../../types';
import type { ColorGroup, ColorProductGroup, SizeGroup, SizeProductGroup } from './types';

export function sortItemsByPriceThenSize(items: AddedTransactionItem[]) {
  items.sort((a, b) => {
    const priceA = typeof a.unitPrice === 'number' ? a.unitPrice : 0;

    const priceB = typeof b.unitPrice === 'number' ? b.unitPrice : 0;

    if (priceA !== priceB) {
      return priceA - priceB;
    }

    const sizeA = a.size?.name ?? '';
    const sizeB = b.size?.name ?? '';

    return sizeA.localeCompare(sizeB);
  });
}

export function groupItemsByColor(
  items: AddedTransactionItem[],
): Record<string, ColorProductGroup> {
  const productsByColor = new Map<string, ColorProductGroup>();

  for (const item of items) {
    const {
      product: { id: productId, name: productName },
      color: { id: colorId, name: colorName, hexValue },
    } = item;

    // Group by product
    if (!productsByColor.has(productId)) {
      productsByColor.set(productId, {
        productId,
        productName,
        colorGroups: {},
      });
    }

    const productColorGroup = productsByColor.get(productId)!;

    // Group by color
    if (!productColorGroup.colorGroups[colorId]) {
      productColorGroup.colorGroups[colorId] = {
        id: colorId,
        name: colorName ?? 'Unknown Color',
        hexValue: hexValue ?? '#000000',
        items: [],
      };
    }

    productColorGroup.colorGroups[colorId].items.push(item);
  }

  // Sort items within each color group
  for (const productGroup of productsByColor.values()) {
    for (const colorGroup of Object.values(productGroup.colorGroups)) {
      sortItemsByPriceThenSize(colorGroup.items);
    }
  }

  return Object.fromEntries(productsByColor);
}

export function groupItemsBySize(items: AddedTransactionItem[]): Record<string, SizeProductGroup> {
  const productsBySize = new Map<string, SizeProductGroup>();

  for (const item of items) {
    const {
      product: { id: productId, name: productName },
      size: { id: sizeId, name: sizeName },
    } = item;

    // Group by product
    if (!productsBySize.has(productId)) {
      productsBySize.set(productId, {
        productId,
        productName,
        sizeGroups: {},
      });
    }

    const productSizeGroup = productsBySize.get(productId)!;

    // Group by size
    if (!productSizeGroup.sizeGroups[sizeId]) {
      productSizeGroup.sizeGroups[sizeId] = {
        id: sizeId,
        quantity: 0,
        subTotal: 0,
        name: sizeName ?? 'Unknown Size',
        items: [],
      };
    }

    productSizeGroup.sizeGroups[sizeId].items.push(item);
    productSizeGroup.sizeGroups[sizeId].quantity += item.quantity;
    productSizeGroup.sizeGroups[sizeId].subTotal +=
      item.quantity * (typeof item.unitPrice === 'number' ? item.unitPrice : 0);
  }

  // Sort items within each size group
  for (const productGroup of productsBySize.values()) {
    for (const sizeGroup of Object.values(productGroup.sizeGroups)) {
      sortItemsByPriceThenSize(sizeGroup.items);
    }
  }

  return Object.fromEntries(productsBySize);
}

export function computeGroups(items: AddedTransactionItem[]): {
  colorProductGroups: ColorProductGroup[];
  productSizeGroups: SizeProductGroup[];
} {
  const byColor = groupItemsByColor(items);
  const bySize = groupItemsBySize(items);

  return {
    colorProductGroups: Object.values(byColor),
    productSizeGroups: Object.values(bySize),
  };
}

export function getColorGroupTotal(group: ColorGroup): number {
  return group.items.reduce(
    (total, item) =>
      total + item.quantity * (typeof item.unitPrice === 'number' ? item.unitPrice : 0),
    0,
  );
}

export function getSizeGroupTotal(group: SizeGroup): number {
  return group.items.reduce(
    (total, item) =>
      total + item.quantity * (typeof item.unitPrice === 'number' ? item.unitPrice : 0),
    0,
  );
}

export function getProductTotal(groups: ColorGroup[]): number {
  return groups.reduce((total, group) => total + getColorGroupTotal(group), 0);
}

export function getSizeProductTotal(groups: SizeGroup[]): number {
  return groups.reduce((total, group) => total + getSizeGroupTotal(group), 0);
}

export function findColorGroup(
  productGroups: ColorProductGroup[],
  key: string,
): ColorGroup | undefined {
  for (const productGroup of productGroups) {
    const group = productGroup.colorGroups[key];

    if (group) {
      return group;
    }
  }

  return undefined;
}
