import { supabase } from "@/integrations/supabase/client";
import type { Receipt, ReceiptItem, DamagedItem, SupplierGroup } from "@/types";

type DbReceipt = {
  id: string;
  vendor_id: string | null;
  vendor_name: string;
  receipt_date: string | null;
  total: number;
  tax: number | null;
  currency: string;
  document_type: string | null;
  payment_method: string | null;
  image_path: string | null;
  status: string;
  parse_method: string | null;
  ocr_text: string | null;
  created_at: string;
  updated_at: string;
};

type DbReceiptItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  damaged_quantity: number;
  damage_notes: string | null;
  product_id: string | null;
  tracked: boolean;
};

const mapItem = (item: DbReceiptItem): ReceiptItem => ({
  id: item.id,
  description: item.description,
  quantity: item.quantity,
  unitPrice: item.unit_price,
  damagedQuantity: item.damaged_quantity,
  damageNotes: item.damage_notes,
  productId: item.product_id,
  tracked: item.tracked,
});

const mapReceipt = (row: DbReceipt, items: DbReceiptItem[]): Receipt => ({
  id: row.id,
  vendorId: row.vendor_id,
  vendorName: row.vendor_name,
  receiptDate: row.receipt_date,
  total: row.total,
  tax: row.tax,
  currency: row.currency,
  documentType: row.document_type,
  paymentMethod: row.payment_method,
  imagePath: row.image_path,
  status: row.status as Receipt["status"],
  parseMethod: row.parse_method as Receipt["parseMethod"],
  ocrText: row.ocr_text,
  items: items.map(mapItem),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const fetchItemsFor = async (receiptIds: string[]): Promise<Map<string, DbReceiptItem[]>> => {
  if (receiptIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("receipt_items")
    .select("*")
    .in("receipt_id", receiptIds)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const byReceipt = new Map<string, DbReceiptItem[]>();
  for (const item of data ?? []) {
    const list = byReceipt.get(item.receipt_id) ?? [];
    list.push(item);
    byReceipt.set(item.receipt_id, list);
  }
  return byReceipt;
};

export const getReceipts = async (): Promise<Receipt[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("user_id", user.id)
    .order("receipt_date", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);

  const itemsByReceipt = await fetchItemsFor((data ?? []).map((r) => r.id));
  return (data ?? []).map((row) =>
    mapReceipt(row as unknown as DbReceipt, itemsByReceipt.get(row.id) ?? [])
  );
};

export const getReceiptById = async (id: string): Promise<Receipt | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching receipt by ID:", error.message);
    return null;
  }

  const itemsByReceipt = await fetchItemsFor([id]);
  return mapReceipt(data as unknown as DbReceipt, itemsByReceipt.get(id) ?? []);
};

export interface ReceiptDraft {
  vendorName: string;
  receiptDate: string | null;
  total: number;
  tax: number | null;
  currency: string;
  documentType: string | null;
  paymentMethod: string | null;
  imagePath: string | null;
  ocrText: string | null;
  parseMethod: "manual" | "ocr" | "ai";
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    productId?: string | null;
    tracked?: boolean;
  }>;
}

export const confirmReceipt = async (draft: ReceiptDraft): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase.rpc("confirm_receipt", {
    p_vendor_name: draft.vendorName,
    p_receipt_date: draft.receiptDate as string,
    p_total: draft.total,
    p_tax: draft.tax as number,
    p_currency: draft.currency,
    p_document_type: draft.documentType as string,
    p_payment_method: draft.paymentMethod as string,
    p_image_path: draft.imagePath as string,
    p_ocr_text: draft.ocrText as string,
    p_parse_method: draft.parseMethod,
    p_items: draft.items,
  });

  if (error) throw new Error(error.message);
  return data as string;
};

export const updateReceipt = async (receipt: Receipt): Promise<Receipt> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("receipts")
    .update({
      vendor_name: receipt.vendorName,
      receipt_date: receipt.receiptDate,
      total: receipt.total,
      tax: receipt.tax,
      currency: receipt.currency,
      document_type: receipt.documentType,
      payment_method: receipt.paymentMethod,
      image_path: receipt.imagePath,
    })
    .eq("id", receipt.id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  await supabase
    .from("receipt_items")
    .delete()
    .eq("receipt_id", receipt.id);

  if (receipt.items.length > 0) {
    const { error: itemsError } = await supabase
      .from("receipt_items")
      .insert(
        receipt.items.map((item) => ({
          receipt_id: receipt.id,
          user_id: user.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          damaged_quantity: item.damagedQuantity,
          damage_notes: item.damageNotes,
          product_id: item.productId,
          tracked: item.tracked,
        }))
      );

    if (itemsError) throw new Error(itemsError.message);
  }

  const updated = await getReceiptById(receipt.id);
  if (!updated) throw new Error("Failed to reload receipt after update");
  return updated;
};

export const deleteReceipt = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("receipts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
};

export const uploadReceiptImage = async (file: File): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error } = await supabase.storage
    .from("receipts")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);
  return filePath;
};

export const getReceiptImageUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, 3600);

  if (error) throw new Error(error.message);
  return data.signedUrl;
};

const mapDamagedItem = (row: Record<string, unknown>, supplierName: string): DamagedItem => ({
  id: row.id as string,
  receiptId: row.receipt_id as string,
  receiptItemId: (row.receipt_item_id as string) ?? null,
  itemDescription: row.item_description as string,
  originalQuantity: row.original_quantity as number,
  actualQuantity: row.actual_quantity as number,
  damagedQuantity: row.damaged_quantity as number,
  damageNotes: (row.damage_notes as string) ?? null,
  supplierName,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

export const getDamagedItemsBySupplier = async (): Promise<SupplierGroup[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("damaged_items")
    .select("*, receipts!inner(vendor_name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const groups = new Map<string, DamagedItem[]>();
  for (const row of data ?? []) {
    const supplierName = (row as unknown as { receipts: { vendor_name: string } }).receipts.vendor_name;
    const item = mapDamagedItem(row, supplierName);
    const list = groups.get(supplierName) ?? [];
    list.push(item);
    groups.set(supplierName, list);
  }

  return Array.from(groups.entries()).map(([supplierName, damagedItems]) => ({
    supplierName,
    damagedItems,
  }));
};

export const deleteDamagedItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("damaged_items")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};
