
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "ai_settings": {
                  Row: {
                    "base_url": string | null,"chat_model": string | null,"created_at": string,"embedding_model": string | null,"enabled": boolean,"provider": string,"tools_supported": boolean,"updated_at": string,"user_id": string,"vision_model": string | null,"vision_supported": boolean
                  }
                  Insert: {
                    "base_url"?: string | null,"chat_model"?: string | null,"created_at"?: string,"embedding_model"?: string | null,"enabled"?: boolean,"provider"?: string,"tools_supported"?: boolean,"updated_at"?: string,"user_id": string,"vision_model"?: string | null,"vision_supported"?: boolean
                  }
                  Update: {
                    "base_url"?: string | null,"chat_model"?: string | null,"created_at"?: string,"embedding_model"?: string | null,"enabled"?: boolean,"provider"?: string,"tools_supported"?: boolean,"updated_at"?: string,"user_id"?: string,"vision_model"?: string | null,"vision_supported"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"ai_usage": {
                  Row: {
                    "created_at": string,"feature": string,"id": number,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"feature": string,"id"?: never,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"feature"?: string,"id"?: never,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"budgets": {
                  Row: {
                    "amount": number,"created_at": string,"currency": string,"id": string,"month": string,"user_id": string
                  }
                  Insert: {
                    "amount": number,"created_at"?: string,"currency"?: string,"id"?: string,"month": string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"currency"?: string,"id"?: string,"month"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"damaged_items": {
                  Row: {
                    "actual_quantity": number,"created_at": string,"damage_notes": string | null,"damaged_quantity": number,"id": string,"item_description": string,"original_quantity": number,"receipt_id": string,"receipt_item_id": string | null,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "actual_quantity"?: number,"created_at"?: string,"damage_notes"?: string | null,"damaged_quantity"?: number,"id"?: string,"item_description": string,"original_quantity"?: number,"receipt_id": string,"receipt_item_id"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "actual_quantity"?: number,"created_at"?: string,"damage_notes"?: string | null,"damaged_quantity"?: number,"id"?: string,"item_description"?: string,"original_quantity"?: number,"receipt_id"?: string,"receipt_item_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "damaged_items_receipt_id_fkey"
      columns: ["receipt_id"]
isOneToOne: false
      referencedRelation: "receipts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "damaged_items_receipt_item_id_fkey"
      columns: ["receipt_item_id"]
isOneToOne: false
      referencedRelation: "receipt_items"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_movements": {
                  Row: {
                    "created_at": string,"delta": number,"id": number,"note": string | null,"product_id": string,"reason": string,"receipt_id": string | null,"receipt_item_id": string | null,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"delta": number,"id"?: never,"note"?: string | null,"product_id": string,"reason": string,"receipt_id"?: string | null,"receipt_item_id"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"delta"?: number,"id"?: never,"note"?: string | null,"product_id"?: string,"reason"?: string,"receipt_id"?: string | null,"receipt_item_id"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_movements_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "inventory_stock"
      referencedColumns: ["product_id"]
    },{
      foreignKeyName: "inventory_movements_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_receipt_id_fkey"
      columns: ["receipt_id"]
isOneToOne: false
      referencedRelation: "receipts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_receipt_item_id_fkey"
      columns: ["receipt_item_id"]
isOneToOne: false
      referencedRelation: "receipt_items"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "category": string | null,"created_at": string,"default_unit": string,"id": string,"low_stock_threshold": number | null,"name": string,"normalized_name": string,"sku": string | null,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "category"?: string | null,"created_at"?: string,"default_unit"?: string,"id"?: string,"low_stock_threshold"?: number | null,"name": string,"normalized_name": string,"sku"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "category"?: string | null,"created_at"?: string,"default_unit"?: string,"id"?: string,"low_stock_threshold"?: number | null,"name"?: string,"normalized_name"?: string,"sku"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"receipt_chunks": {
                  Row: {
                    "content": string,"created_at": string,"embedding": string | null,"fts": unknown,"id": number,"receipt_id": string,"user_id": string
                  }
                  Insert: {
                    "content": string,"created_at"?: string,"embedding"?: string | null,"fts"?: never,"id"?: never,"receipt_id": string,"user_id": string
                  }
                  Update: {
                    "content"?: string,"created_at"?: string,"embedding"?: string | null,"fts"?: never,"id"?: never,"receipt_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "receipt_chunks_receipt_id_fkey"
      columns: ["receipt_id"]
isOneToOne: false
      referencedRelation: "receipts"
      referencedColumns: ["id"]
    }
                  ]
                },"receipt_items": {
                  Row: {
                    "created_at": string,"damage_notes": string | null,"damaged_quantity": number,"description": string,"id": string,"product_id": string | null,"quantity": number,"receipt_id": string,"tracked": boolean,"unit_price": number,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"damage_notes"?: string | null,"damaged_quantity"?: number,"description": string,"id"?: string,"product_id"?: string | null,"quantity"?: number,"receipt_id": string,"tracked"?: boolean,"unit_price"?: number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"damage_notes"?: string | null,"damaged_quantity"?: number,"description"?: string,"id"?: string,"product_id"?: string | null,"quantity"?: number,"receipt_id"?: string,"tracked"?: boolean,"unit_price"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "receipt_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "inventory_stock"
      referencedColumns: ["product_id"]
    },{
      foreignKeyName: "receipt_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "receipt_items_receipt_id_fkey"
      columns: ["receipt_id"]
isOneToOne: false
      referencedRelation: "receipts"
      referencedColumns: ["id"]
    }
                  ]
                },"receipts": {
                  Row: {
                    "ai_raw": Json | null,"created_at": string,"currency": string,"document_type": string | null,"id": string,"image_path": string | null,"ocr_text": string | null,"parse_method": string | null,"payment_method": string | null,"receipt_date": string | null,"status": string,"tax": number | null,"total": number,"updated_at": string,"user_id": string,"vendor_id": string | null,"vendor_name": string
                  }
                  Insert: {
                    "ai_raw"?: Json | null,"created_at"?: string,"currency"?: string,"document_type"?: string | null,"id"?: string,"image_path"?: string | null,"ocr_text"?: string | null,"parse_method"?: string | null,"payment_method"?: string | null,"receipt_date"?: string | null,"status"?: string,"tax"?: number | null,"total"?: number,"updated_at"?: string,"user_id": string,"vendor_id"?: string | null,"vendor_name"?: string
                  }
                  Update: {
                    "ai_raw"?: Json | null,"created_at"?: string,"currency"?: string,"document_type"?: string | null,"id"?: string,"image_path"?: string | null,"ocr_text"?: string | null,"parse_method"?: string | null,"payment_method"?: string | null,"receipt_date"?: string | null,"status"?: string,"tax"?: number | null,"total"?: number,"updated_at"?: string,"user_id"?: string,"vendor_id"?: string | null,"vendor_name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "receipts_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    }
                  ]
                },"user_settings": {
                  Row: {
                    "created_at": string,"currency": string,"date_format": string,"full_name": string | null,"locale": string,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"currency"?: string,"date_format"?: string,"full_name"?: string | null,"locale"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"currency"?: string,"date_format"?: string,"full_name"?: string | null,"locale"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"vendors": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "inventory_stock": {
                  Row: {
                    "default_unit": string | null,"low_stock_threshold": number | null,"name": string | null,"product_id": string | null,"quantity": number | null,"user_id": string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "adjust_stock":
{ Args: { "p_delta": number,"p_note": string,"p_product_id": string,"p_reason": string }; Returns: number
                           },
"confirm_receipt":
{ Args: { "p_currency"?: string,"p_document_type"?: string,"p_image_path"?: string,"p_items"?: Json,"p_ocr_text"?: string,"p_parse_method"?: string,"p_payment_method"?: string,"p_receipt_date"?: string,"p_tax"?: number,"p_total"?: number,"p_vendor_name": string }; Returns: string
                           },
"hybrid_search":
{ Args: { "p_full_text_weight"?: number,"p_match_count"?: number,"p_query_embedding": string,"p_query_text": string,"p_rrf_k"?: number,"p_semantic_weight"?: number }; Returns: {
              "content": string,"created_at": string,"id": number,"receipt_id": string,"user_id": string
            }[]
                           },
"report_damage":
{ Args: { "p_damage_notes": string,"p_damaged_quantity": number,"p_receipt_id": string,"p_receipt_item_id": string }; Returns: string
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const

