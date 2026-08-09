export type InventoryTableProps = {
  productName: string;
  colors: string[];
  sizes: string[];
};

export type DraggableColorHeaderProps = {
  color: string;
  index: number;
  totalColumns: number;
  onDrop: (fromIndex: number, toIndex: number) => void;
};
