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
  noSpace?: boolean | undefined,
): string {
  // 2 labels
  if (!label3) {
    const { label1Length, label2Length } = { label1Length: noSpace ? 10 : 9, label2Length: 20 };
    return `${noSpace ? '' : ' '}${label1?.padEnd(label1Length, ' ')?.slice(0, label1Length)} ${label2?.padEnd(label2Length, ' ')?.slice(0, label2Length)}`;
  }

  // 3 labels
  if (!label4) {
    const { label1Length, label2Length, label3Length } = {
      label1Length: noSpace ? 5 : 4,
      label2Length: 12,
      label3Length: 12,
    };
    return `${noSpace ? '' : ' '}${label1?.padEnd(label1Length, ' ')?.slice(0, label1Length)} ${label2?.padEnd(label2Length, ' ')?.slice(0, label2Length)} ${label3?.padEnd(label3Length, ' ')?.slice(0, label3Length)}`;
  }

  // 4 labels
  const { label1Length, label2Length, label3Length, label4Length } = {
    label1Length: noSpace ? 5 : 4,
    label2Length: 8,
    label3Length: 8,
    label4Length: 8,
  };
  return `${noSpace ? '' : ' '}${label1?.padEnd(label1Length, ' ')?.slice(0, label1Length)} ${label2?.padEnd(label2Length, ' ')?.slice(0, label2Length)} ${label3?.padEnd(label3Length, ' ')?.slice(0, label3Length)} ${label4?.padEnd(label4Length, ' ')?.slice(0, label4Length)}`;
}

export function formatPrintGroupedItems(
  colorProductGroups: ColorProductGroup[],
  productSizeGroups: SizeProductGroup[],
  viewMode: ViewMode,
  showColorsForSizeView: boolean,
  showUnitPrice: boolean,
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
            return `${groupedItems}${toPrintableLine(item?.size?.name, showUnitPrice ? `P${formatNumber(item?.unitPrice)}` : '', `${item.quantity}`, `P${formatNumber(item.total)}`)}\n`;
          }, '');
          return `${groupedColor}${colorName ?? 'color'}\n${items}`;
        },
        '',
      );

      return `${groupedProd}${'\n'.padStart(lineLength, '-')}${productName ?? 'product'}\n${colorGroupText}`;
    }, '');
  } else if (viewMode === 'size') {
    finalText = productSizeGroups.reduce((groupedProd, currProduct) => {
      const productName = currProduct?.productName?.slice(0, lineLength);

      const sizeGroupText = Object.values(currProduct.sizeGroups).reduce(
        (groupedSize, currSize) => {
          const sizeText = toPrintableLine(
            currSize?.name,
            showUnitPrice && !showColorsForSizeView ? `P${formatNumber(currSize?.price)}` : '',
            !showColorsForSizeView ? `${currSize.quantity}` : '',
            `P${formatNumber(currSize.subTotal)}`,
            true,
          );

          let colors = '';
          if (showColorsForSizeView)
            colors = currSize.items.reduce((groupedItems, item) => {
              return `${groupedItems}${toPrintableLine(item?.color?.name, showUnitPrice ? `P${formatNumber(item?.unitPrice)}` : '', `${item.quantity}`, `P${formatNumber(item.total)}`)}\n`;
            }, '');
          return `${groupedSize}${sizeText ?? 'size'}\n${colors}`;
        },
        '',
      );

      return `${groupedProd}${'\n'.padStart(lineLength, '-')}${productName ?? 'product'}\n${sizeGroupText}`;
    }, '');
  }

  const padding = (lineLength + 7) / 2;
  finalText = `
${'JPJ RTW'.padStart(padding, ' ')}
Date: ${formatDate(transactionDate, false, true).slice(0, lineLength)}
Name: ${buyersName}
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
