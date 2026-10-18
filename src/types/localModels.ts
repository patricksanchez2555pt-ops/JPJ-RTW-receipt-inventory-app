// ==========================================
// CONFIGS
// ==========================================

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

// ==========================================
// INVENTORY
// ==========================================

export type Inventory = {
  productId: string;
  colorId: string;
  sizeId: string;
  quantity: number;
  updatedAt?: string;
};

// ==========================================
// TRANSACTIONS
// ==========================================

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
  createdBy?: string;

  customerId?: string;
  buyerName: string;

  paidAmount: number;

  subtotal: number;
  discount: number;
  total: number;

  items?: TransactionItem[];
};

// ==========================================
// LABOR & OPERATIONS (STREAMLINED)
// ==========================================

export type Operation = {
  id: string;
  productId: string;
  name: string; // e.g., "highspeed", "edging", "piping", "gathering"
  description?: string;
  createdAt: string;
};

export type Worker = {
  id: string;
  name: string;
  phone?: string;
  defaultOperations: string[]; // Array of operation IDs that the worker is skilled at
  createdAt: string;
};

// Rate Master: Price per operation per product per size
export type LaborRate = {
  id: string;
  productId: string;
  sizeId: string;
  operationId: string;
  ratePerUnit: number; // Price paid to worker per unit completed
  updatedAt: string;
};

// Individual labor log entry for weekly tally and payroll
export type LaborItem = {
  id: string;
  productId: string;
  sizeId: string;
  operationId: string;
  workerId: string;
  quantity: number;
  ratePerUnit: number; // Captured snapshot of rate
  subtotal: number; // quantity * ratePerUnit
  date: string; // Date of work completion
};

export type Deduction = {
  id: string;
  workerId: string;
  amount: number;
  label: string;
  date: string;
  createdAt: string;
};
