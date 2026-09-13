export type Product = {
  id: string;
  name: string;
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
  price: number; // Default price
};

export type Customer = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export type CustomerPrice = {
  id: string;
  productId: string;
  customerId: string;
  sizeId: string;
  price: number;
  updatedAt: string;
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
  unitPrice: number; // Price actually charged
  total: number;
};

export type Transaction = {
  id: string;
  date: string;

  customerId?: string;
  buyerName: string;

  subtotal: number;
  discount: number;
  total: number;

  items?: TransactionItem[];
};
