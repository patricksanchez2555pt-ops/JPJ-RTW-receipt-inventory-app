export type ColorItem = {
  name: string;
  hexValue: string;
};

export type InventoryTableProps = {
  productName: string;
  colors: ColorItem[];
  sizes: string[];
};

export type DraggableColorHeaderProps = {
  color: ColorItem;
  index: number;
  totalColumns: number;
  onDrop: (fromIndex: number, toIndex: number) => void;
};
