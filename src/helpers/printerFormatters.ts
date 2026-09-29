import type { Transaction } from '@/types/localModels';
import { formatDate } from '@/utils/dateUtils';
import { formatNumber } from '@/utils/formatNumber';

import type { ViewMode } from '../components/transactions/components/added-items-panel/AddedItemsPanel';
import type {
  ColorProductGroup,
  SizeProductGroup,
} from '../components/transactions/components/added-items-panel/types';

const lineLength = 32;

// added items formatter

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

export function formatPrintGroupedItems(
  colorProductGroups: ColorProductGroup[],
  productSizeGroups: SizeProductGroup[],
  viewMode: ViewMode,
  showColorsForSizeView: boolean,
  transactionDate: string,
  buyersName: string,
): string {
  let finalText = '';

  if (viewMode === 'color') {
    finalText = colorProductGroups.reduce((groupedProd, currProduct) => {
      const productName = currProduct?.productName?.slice(0, lineLength);

      const colorGroupText = Object.values(currProduct.colorGroups).reduce(
        (groupedColor, currColor) => {
          const colorName = currColor?.name?.slice(0, lineLength);
          const items = currColor.items.reduce((groupedItems, item) => {
            return `${groupedItems}${toPrintableLine(item?.size?.name, `P${formatNumber(item?.unitPrice)}`, `${item.quantity}`, `P${formatNumber(item.total)}`)}\n`;
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
            `P${formatNumber(currSize?.price)}`,
            `${currSize.quantity}`,
            `P${formatNumber(currSize.subTotal)}`,
          );

          let colors = '';
          if (showColorsForSizeView)
            colors = currSize.items.reduce((groupedItems, item) => {
              return `${groupedItems}${toPrintableLine(item?.color?.name, `P${formatNumber(item?.unitPrice)}`, `${item.quantity}`, `P${formatNumber(item.total)}`)}\n`;
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
Date: ${formatDate(transactionDate, false, true).slice(0, lineLength)}
Name: ${buyersName}
${''.padEnd(lineLength, '-')}
${finalText}
${''.padEnd(lineLength, '-')}
Signature: 
${''.padEnd(lineLength, '_')}
`;

  return finalText;
}

// transaction list formatter
export function formatPrintTransactions(transactions: (Transaction | undefined)[]) {
  let groupTotal = 0;
  const finalText = transactions?.reduce((acc, curr) => {
    if (!curr) return acc;
    const { total, date } = curr;
    groupTotal = groupTotal + total;
    return `${acc}${formatDate(date, true).slice(0, lineLength)} - P${formatNumber(total)}\n`;
  }, '');

  return `
JPJ RTW
Date: ${formatDate(new Date().toISOString(), true).slice(0, lineLength)}
${''.padEnd(lineLength, '-')}
${finalText}
${''.padEnd(lineLength, '-')}
total:    P${formatNumber(groupTotal)}
${''.padEnd(lineLength, '-')}
Signature: 
${''.padEnd(lineLength, '_')}
`;
}
