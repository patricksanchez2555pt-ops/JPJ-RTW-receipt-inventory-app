export type ColorItem = {
  name: string;
  hexValue: string;
};

export type QuantityChangeEvent = {
  size: string;
  color: string;
  quantity: number;
};

export type InventoryTableProps = {
  productName: string;
  colors: ColorItem[];
  sizes: string[];
  onQuantityChange?: (event: QuantityChangeEvent) => void;
};

export type InventoryCellProps = {
  size: string;
  colorName: string;
  hexValue: string;
  initialQuantity?: number;
  onQuantityChange?: (event: QuantityChangeEvent) => void;
};
