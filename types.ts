
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  supplierId: string;
  price: number;
  cost: number;
  quantity: number;
  reorderLevel: number;
  unit: string;
  batchNumber: string;
  expiryDate?: string;
  lastUpdated: string;
}

export enum TransactionType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  ADJUSTMENT = 'ADJUSTMENT'
}

export interface Transaction {
  id: string;
  productId: string;
  userId: string;
  type: TransactionType;
  quantity: number;
  date: string;
  note: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}

export interface AppState {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
  currentUser: User;
  logs: AuditLog[];
}
