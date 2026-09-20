import type { AddedTransactionItem } from '../../form/types';

export type ColorGroup = {
  id: string;
  name: string;
  hexValue: string;
  quantity: number;
  subTotal: number;
  items: AddedTransactionItem[];
};

export type ColorProductGroup = {
  productId: string;
  productName: string;
  quantity: number;
  subTotal: number;
  colorGroups: Record<string, ColorGroup>;
};

export type SizeGroup = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subTotal: number;
  items: AddedTransactionItem[];
};

export type SizeProductGroup = {
  productId: string;
  productName: string;
  quantity: number;
  subTotal: number;
  sizeGroups: Record<string, SizeGroup>;
};
