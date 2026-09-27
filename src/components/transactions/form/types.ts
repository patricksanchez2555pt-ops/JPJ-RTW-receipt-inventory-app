import type { Color, Product, Size, TransactionItem } from '../../../types/localModels';

export type SelectedSize = {
  size: Size;
  quantity: number;
};

export type AddedTransactionItem = TransactionItem & {
  product: Product;
  color: Color;
  size: Size;
};

export type ProductOption = {
  product: Product;
  colors: Color[];
  sizes: Size[];
};
