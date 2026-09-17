import type { AddedTransactionItem } from '../../create/types';
import type { ColorProductGroup, SizeGroup, SizeProductGroup } from './types';

function sortColorGroupItemsByPrice(items: AddedTransactionItem[]) {
  items.sort((a, b) => {
    const priceA = typeof a.unitPrice === 'number' ? a.unitPrice : 0;

    const priceB = typeof b.unitPrice === 'number' ? b.unitPrice : 0;

    return priceA - priceB;
  });
}

export function getSortedSizeGroup(sizeGroups: Record<string, SizeGroup>) {
  return Object.values(sizeGroups).sort((a, b) => {
    const priceA = typeof a.price === 'number' ? a.price : 0;
    const priceB = typeof b.price === 'number' ? b.price : 0;
    return priceA - priceB;
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
        quantity: 0,
        subTotal: 0,
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
        quantity: 0,
        subTotal: 0,
        items: [],
      };
    }

    productColorGroup.colorGroups[colorId].items.push(item);
    productColorGroup.colorGroups[colorId].quantity += item.quantity;
    productColorGroup.colorGroups[colorId].subTotal +=
      item.quantity * (typeof item.unitPrice === 'number' ? item.unitPrice : 0);

    productColorGroup.quantity += item.quantity;
    productColorGroup.subTotal +=
      item.quantity * (typeof item.unitPrice === 'number' ? item.unitPrice : 0);
  }

  // Sort items within each color group
  for (const productGroup of productsByColor.values()) {
    for (const colorGroup of Object.values(productGroup.colorGroups)) {
      sortColorGroupItemsByPrice(colorGroup.items);
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
        quantity: 0,
        subTotal: 0,
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
        price: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
      };
    }

    productSizeGroup.sizeGroups[sizeId].items.push(item);
    productSizeGroup.sizeGroups[sizeId].quantity += item.quantity;
    productSizeGroup.sizeGroups[sizeId].subTotal +=
      item.quantity * (typeof item.unitPrice === 'number' ? item.unitPrice : 0);

    productSizeGroup.quantity += item.quantity;
    productSizeGroup.subTotal +=
      item.quantity * (typeof item.unitPrice === 'number' ? item.unitPrice : 0);
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
