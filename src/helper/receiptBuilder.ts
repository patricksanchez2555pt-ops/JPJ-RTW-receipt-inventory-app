import type { AddedTransactionItem } from '../components/transactions/create/types';
import type { PrintableProduct } from '../service/escPos';

export function toPrintableProducts(items: AddedTransactionItem[]): PrintableProduct[] {
  const grouped = new Map<string, PrintableProduct>();

  for (const item of items) {
    const productId = item.product.id;

    let product = grouped.get(productId);

    if (!product) {
      product = {
        name: item.product.name,
        items: [],
      };

      grouped.set(productId, product);
    }

    product.items.push({
      size: item.size.name,
      price: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.total,
    });
  }

  return Array.from(grouped.values());
}
