src/
├── constants/
│ ├── layout.ts # ROW_HEIGHT, SIZE_COLUMN_WIDTH, TABLE_HEIGHT
│ └── colors.ts # Palette defaults and theme tokens
│
├── types/
│ ├── localModels.ts # Database schemas (Product, Color, Size, Inventory, Transaction)
│ └── components.ts # Props & event payload types (e.g., QuantityChangeEvent)
│
├── services/
│ ├── mmkv.ts # Base MMKV storage instance initialization
│ └── localStorage/
│ ├── productRepo.ts # Product local CRUD operations
│ ├── colorRepo.ts # Color local CRUD operations
│ ├── sizeRepo.ts # Size local CRUD operations
│ ├── inventoryRepo.ts # Inventory map & quantity update methods
│ ├── transactionRepo.ts# Transaction creation & automatic stock deduction
│ └── index.ts # Barrel export for repository modules
│
├── utils/
│ ├── color.ts # getSubtleBgColor helper
│ ├── mapper.ts # Data transformation & mapping utilities
│ └── seeder.ts # Initial mock/demo data seeder for local storage
│
├── hooks/
│ ├── useLocalInventory.ts # Hook connecting local storage to table state
│ └── useTransactions.ts # Hook for logging & fetching transactions
│
└── components/
└── inventory/
├── InventoryTable.tsx # Main table container with synchronized scrolling
├── DraggableColorHeader.tsx # Header cell with Reanimated gesture drag
├── InventoryCell.tsx # Unit quantity controls (+/- input)
└── index.ts # Barrel export for inventory UI
