export interface Items {
  label: string;
  count: number;
  limit: number;
  type: string;
  name: string;
  usable: boolean;
  rare: boolean;
  canRemove: boolean;
  durability: number;
  weight: number;
}

export interface InventoryItems extends Items {
  usable: boolean;
  canRemove: boolean;
  rare: boolean;
  name: string;
  count: number;
  label: string;
  type: string;
  weight: number;
}

export interface Money {
  money: number;
}
