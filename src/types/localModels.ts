export type Product = {
  id: string;
  name: string;
  createdAt: string;
};

export type Price = {
  id: string;
  sizeId: string;
  price: number;
  createdAt: string;
};

export type Color = {
  id: string;
  productId: string;
  name: string;
  hexValue: string;
};

export type Size = {
  id: string;
  productId: string;
  name: string;
  price: number;
};

export type Inventory = {
  productId: string;
  colorId: string;
  sizeId: string;
  quantity: number;
  updatedAt?: string;
};

export type TransactionItem = {
  id: string;
  transactionId: string;
  productId: string;
  colorId: string;
  sizeId: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Transaction = {
  id: string;
  date: string;
  buyerName: string;
  subtotal: number;
  discount: number;
  total: number;
  items?: TransactionItem[];
};
