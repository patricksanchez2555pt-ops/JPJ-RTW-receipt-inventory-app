import { formatDate } from '@/utils/dateFormat';

import type { AddedTransactionItem } from '../../form/types';
import type { ViewMode } from './AddedItemsPanel';
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

// line length: 32 chars
function toPrintableLine(
  label1: string,
  label2: string,
  label3: string | undefined,
  label4: string | undefined,
): string {
  // 2 labels
  if (!label3)
    return `${label1?.padEnd(10, ' ')?.slice(0, 10)} ${label2?.padEnd(20, ' ')?.slice(0, 20)}`;
  // 3 labels
  if (!label4)
    return `${label1?.padEnd(5, ' ')?.slice(0, 5)} ${label2?.padEnd(12, ' ')?.slice(0, 12)} ${label3?.padEnd(12, ' ')?.slice(0, 12)}`;
  // 4 labels
  return `${label1?.padEnd(5, ' ')?.slice(0, 5)} ${label2?.padEnd(8, ' ')?.slice(0, 8)} ${label3?.padEnd(8, ' ')?.slice(0, 8)} ${label4?.padEnd(8, ' ')?.slice(0, 8)}`;
}

export function toPrintableFormat(
  colorProductGroups: ColorProductGroup[],
  productSizeGroups: SizeProductGroup[],
  viewMode: ViewMode,
  showColorsForSizeView: boolean,
  transactionDate: string,
  buyersName: string,
): string {
  const lineLength = 32;
  let finalText = '';

  if (viewMode === 'color') {
    finalText = colorProductGroups.reduce((groupedProd, currProduct) => {
      const productName = currProduct?.productName?.slice(0, lineLength);

      const colorGroupText = Object.values(currProduct.colorGroups).reduce(
        (groupedColor, currColor) => {
          const colorName = currColor?.name?.slice(0, lineLength);
          const items = currColor.items.reduce((groupedItems, item) => {
            return `${groupedItems}${toPrintableLine(item?.size?.name, `P${item?.unitPrice}`, `${item.quantity}`, `P${item.total}`)}\n`;
          }, '');
          return `${groupedColor}${colorName ?? 'color'}\n${items}`;
        },
        '',
      );

      return `${groupedProd}${productName ?? 'product'}\n${colorGroupText}`;
    }, '');
  } else if (viewMode === 'size') {
    finalText = productSizeGroups.reduce((groupedProd, currProduct) => {
      const productName = currProduct?.productName?.slice(0, lineLength);

      const sizeGroupText = Object.values(currProduct.sizeGroups).reduce(
        (groupedSize, currSize) => {
          const sizeText = toPrintableLine(
            currSize?.name,
            `P${currSize?.price}`,
            `${currSize.quantity}`,
            `P${currSize.subTotal}`,
          );

          let colors = '';
          if (showColorsForSizeView)
            colors = currSize.items.reduce((groupedItems, item) => {
              return `${groupedItems}${toPrintableLine(item?.color?.name, `P${item?.unitPrice}`, `${item.quantity}`, `P${item.total}`)}\n`;
            }, '');
          return `${groupedSize}${sizeText ?? 'size'}\n${colors}`;
        },
        '',
      );

      return `${groupedProd}${productName ?? 'product'}\n${sizeGroupText}`;
    }, '');
  }

  finalText = `
JPJ RTW
Date: ${formatDate(transactionDate, true, true).slice(0, lineLength)}
Name: ${buyersName}
${''.padEnd(lineLength, '-')}
${finalText}
${''.padEnd(lineLength, '-')}
Signature: 
${''.padEnd(lineLength, '_')}
`;

  return finalText;
}
