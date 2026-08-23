export type PrintableTransaction = {
  buyerName: string;
  date: string;
  subtotal: number;
  discount: number;
  total: number;
  products: PrintableProduct[];
};

export type PrintableProduct = {
  name: string;
  items: PrintableProductItem[];
};

export type PrintableProductItem = {
  size: string;
  price: number;
  quantity: number;
  subtotal: number;
};

const encoder = new TextEncoder();

const ESC = 0x1b;
const GS = 0x1d;

const RECEIPT_WIDTH = 32;

export const ESC_POS = {
  INIT: [ESC, 0x40],

  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],

  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],

  NORMAL_SIZE: [GS, 0x21, 0x00],

  DOUBLE_HEIGHT: [GS, 0x21, 0x01],
  DOUBLE_WIDTH: [GS, 0x21, 0x10],
  DOUBLE_SIZE: [GS, 0x21, 0x11],

  FEED_1: [0x0a],
  FEED_2: [0x0a, 0x0a],
  FEED_3: [0x0a, 0x0a, 0x0a],

  CUT: [GS, 0x56, 0x00],
} as const;

/**
 * Convert text to printer bytes.
 */
export function text(value: string): number[] {
  return Array.from(encoder.encode(value));
}

/**
 * Print one line.
 */
export function line(value: string): number[] {
  return [...text(value), 0x0a];
}

/**
 * Horizontal separator.
 */
export function separator(): number[] {
  return line('-'.repeat(RECEIPT_WIDTH));
}

/**
 * Pad/truncate a value to a specific width.
 */
function fit(value: string, width: number): string {
  if (value.length > width) {
    return value.substring(0, width);
  }

  return value;
}

/**
 * Right-align a value.
 */
function right(value: string, width: number): string {
  if (value.length >= width) {
    return value.substring(0, width);
  }

  return ' '.repeat(width - value.length) + value;
}

/**
 * Create a left/right row.
 *
 * Example:
 *
 * TOTAL                    960.00
 */
export function createColumns(left: string, rightValue: string): number[] {
  const rightWidth = 10;
  const leftWidth = RECEIPT_WIDTH - rightWidth;

  const leftText = fit(left, leftWidth);

  const rightText = right(rightValue, rightWidth);

  return line(leftText + rightText);
}

/**
 * Product title.
 */
export function productHeader(productName: string): number[] {
  const data: number[] = [];

  data.push(...separator());

  data.push(...ESC_POS.BOLD_ON);

  data.push(...line(productName));

  data.push(...ESC_POS.BOLD_OFF);

  data.push(...separator());

  return data;
}

/**
 * Column header:
 *
 * Size   Price   Qty    Subtotal
 */
export function itemHeader(): number[] {
  const sizeWidth = 7;
  const priceWidth = 8;
  const qtyWidth = 5;
  const subtotalWidth = 12;

  const row =
    fit('Size', sizeWidth) +
    fit('Price', priceWidth) +
    right('Qty', qtyWidth) +
    right('Subtotal', subtotalWidth);

  return line(row);
}

/**
 * Product item:
 *
 * S      120.00    2      240.00
 */
export function itemRow(size: string, price: number, quantity: number, subtotal: number): number[] {
  const sizeWidth = 7;
  const priceWidth = 8;
  const qtyWidth = 5;
  const subtotalWidth = 12;

  const row =
    fit(size, sizeWidth) +
    right(price.toFixed(2), priceWidth) +
    right(String(quantity), qtyWidth) +
    right(subtotal.toFixed(2), subtotalWidth);

  return line(row);
}

/**
 * Product total:
 *
 * Product total       4   520.00
 */
export function productTotal(quantity: number, total: number): number[] {
  const labelWidth = 19;
  const quantityWidth = 5;
  const totalWidth = 8;

  const row =
    fit('Product total', labelWidth) +
    right(String(quantity), quantityWidth) +
    right(total.toFixed(2), totalWidth);

  return line(row);
}

/**
 * Build one complete product section.
 */
export function buildProductSection(productName: string, items: PrintableProductItem[]): number[] {
  const data: number[] = [];

  /*
   * Product name
   */
  data.push(...productHeader(productName));

  /*
   * Column headings
   */
  data.push(...itemHeader());

  data.push(...separator());

  /*
   * Product items
   */
  let totalQuantity = 0;
  let totalAmount = 0;

  for (const item of items) {
    data.push(...itemRow(item.size, item.price, item.quantity, item.subtotal));

    totalQuantity += item.quantity;
    totalAmount += item.subtotal;
  }

  /*
   * Product total
   */
  data.push(...separator());

  data.push(...productTotal(totalQuantity, totalAmount));

  /*
   * Separator after product.
   */
  data.push(...separator());

  return data;
}

/**
 * Build the complete receipt.
 */
export function buildReceipt(transaction: PrintableTransaction): number[] {
  const data: number[] = [];

  /*
   * Initialize printer.
   */
  data.push(...ESC_POS.INIT);

  /*
   * Left aligned.
   */
  data.push(...ESC_POS.ALIGN_LEFT);

  /*
   * ==========================
   * PRODUCTS
   * ==========================
   */

  for (const product of transaction.products) {
    data.push(...buildProductSection(product.name, product.items));
  }

  /*
   * ==========================
   * TRANSACTION TOTAL
   * ==========================
   */

  data.push(...separator());

  /*
   * Subtotal + discount
   */
  if (transaction.discount > 0) {
    data.push(...createColumns('Subtotal', transaction.subtotal.toFixed(2)));

    data.push(...createColumns('Discount', transaction.discount.toFixed(2)));

    data.push(...separator());
  }

  /*
   * TOTAL
   */
  data.push(...ESC_POS.BOLD_ON);

  data.push(...createColumns('TOTAL', transaction.total.toFixed(2)));

  data.push(...ESC_POS.BOLD_OFF);

  /*
   * ==========================
   * FOOTER
   * ==========================
   */

  data.push(...ESC_POS.FEED_2);

  data.push(...ESC_POS.ALIGN_CENTER);

  data.push(...line('Thank you!'));

  data.push(...ESC_POS.FEED_3);

  /*
   * Cut paper.
   */
  data.push(...ESC_POS.CUT);

  return data;
}
