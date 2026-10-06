export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  damagedQuantity: number;
  damageNotes: string | null;
  productId: string | null;
  tracked: boolean;
}

export interface Receipt {
  id: string;
  vendorId: string | null;
  vendorName: string;
  receiptDate: string | null;
  total: number;
  tax: number | null;
  currency: string;
  documentType: string | null;
  paymentMethod: string | null;
  imagePath: string | null;
  status: 'draft' | 'confirmed' | 'failed';
  parseMethod: 'manual' | 'ocr' | 'ai' | null;
  ocrText: string | null;
  items: ReceiptItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  defaultUnit: string;
  category: string | null;
  sku: string | null;
  lowStockThreshold: number | null;
}

export interface InventoryMovement {
  id: number;
  productId: string;
  delta: number;
  reason: 'purchase' | 'damage' | 'manual_in' | 'manual_out' | 'correction';
  receiptId: string | null;
  receiptItemId: string | null;
  note: string | null;
  createdAt: string;
}

export interface StockItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  error?: boolean;
}

export interface DamagedItem {
  id: string;
  receiptId: string;
  receiptItemId: string | null;
  itemDescription: string;
  originalQuantity: number;
  actualQuantity: number;
  damagedQuantity: number;
  damageNotes: string | null;
  supplierName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierGroup {
  supplierName: string;
  damagedItems: DamagedItem[];
}

export interface UserSettings {
  userId: string;
  fullName: string | null;
  currency: string;
  dateFormat: string;
  locale: 'ar' | 'fr' | 'en';
  createdAt: string;
  updatedAt: string;
}

export interface AiSettings {
  enabled: boolean;
  provider: 'gemini' | 'openai_compatible';
  baseUrl: string | null;
  chatModel: string | null;
  visionModel: string | null;
  embeddingModel: string | null;
  toolsSupported: boolean;
  visionSupported: boolean;
}
