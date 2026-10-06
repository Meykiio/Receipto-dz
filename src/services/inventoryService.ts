import { supabase } from "@/integrations/supabase/client";
import type { Product, InventoryMovement, StockItem } from "@/types";

type DbProduct = {
  id: string;
  name: string;
  normalized_name: string;
  default_unit: string;
  category: string | null;
  sku: string | null;
  low_stock_threshold: number | null;
};

type DbStockRow = {
  product_id: string | null;
  user_id: string | null;
  name: string | null;
  default_unit: string | null;
  low_stock_threshold: number | null;
  quantity: number | null;
};

const mapProduct = (row: DbProduct): Product => ({
  id: row.id,
  name: row.name,
  defaultUnit: row.default_unit,
  category: row.category,
  sku: row.sku,
  lowStockThreshold: row.low_stock_threshold,
});

const mapStockRow = (row: DbStockRow): StockItem => ({
  id: row.product_id ?? "",
  name: row.name ?? "",
  defaultUnit: row.default_unit ?? "pc",
  category: null,
  sku: null,
  lowStockThreshold: row.low_stock_threshold,
  quantity: row.quantity ?? 0,
});

export const getInventory = async (): Promise<StockItem[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("inventory_stock")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapStockRow);
};

export const findMatchingProducts = async (name: string): Promise<Product[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const normalized = name.trim().toLowerCase();
  if (!normalized) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .or(`normalized_name.ilike.%${normalized}%,normalized_name.%${normalized}%`)
    .order("name")
    .limit(5);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProduct);
};

export const createProduct = async (name: string, defaultUnit = "pc", lowStockThreshold?: number | null): Promise<Product> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const normalized = name.trim().toLowerCase();
  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: name.trim(),
      normalized_name: normalized,
      default_unit: defaultUnit,
      low_stock_threshold: lowStockThreshold ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapProduct(data);
};

export const updateProduct = async (
  productId: string,
  fields: { name?: string; defaultUnit?: string; lowStockThreshold?: number | null }
): Promise<Product> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const patch: { name?: string; normalized_name?: string; default_unit?: string; low_stock_threshold?: number | null } = {};
  if (fields.name != null) {
    patch.name = fields.name.trim();
    patch.normalized_name = fields.name.trim().toLowerCase();
  }
  if (fields.defaultUnit != null) patch.default_unit = fields.defaultUnit;
  if (fields.lowStockThreshold !== undefined) patch.low_stock_threshold = fields.lowStockThreshold;

  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", productId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapProduct(data);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
};

export const getProductHistory = async (productId: string): Promise<InventoryMovement[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    delta: row.delta,
    reason: row.reason as InventoryMovement["reason"],
    receiptId: row.receipt_id,
    receiptItemId: row.receipt_item_id,
    note: row.note,
    createdAt: row.created_at,
  }));
};

export const adjustStock = async (
  productId: string,
  delta: number,
  reason: "manual_in" | "manual_out" | "correction",
  note: string | null = null
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase.rpc("adjust_stock", {
    p_product_id: productId,
    p_delta: delta,
    p_reason: reason as string,
    p_note: note as string,
  });

  if (error) throw new Error(error.message);
};
