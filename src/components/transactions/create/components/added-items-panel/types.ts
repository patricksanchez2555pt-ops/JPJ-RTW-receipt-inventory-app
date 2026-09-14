import type { AddedTransactionItem } from '../../types';

export type ColorGroup = {
  id: string;
  name: string;
  hexValue: string;
  items: AddedTransactionItem[];
};

export type ColorProductGroup = {
  productId: string;
  productName: string;
  colorGroups: Record<string, ColorGroup>;
};

export type SizeGroup = {
  id: string;
  name: string;
  quantity: number;
  subTotal: number;
  items: AddedTransactionItem[];
};

export type SizeProductGroup = {
  productId: string;
  productName: string;
  sizeGroups: Record<string, SizeGroup>;
};
