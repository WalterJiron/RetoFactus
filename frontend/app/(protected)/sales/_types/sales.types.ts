export type SaleStatus = "pending" | "completed" | "cancelled";

export interface SaleDetail {
  id_detail?: number;
  sale_id?: number;
  product_id: number;
  product_code?: string;
  product_name?: string;
  product_description?: string;
  product_measurement_unit?: string;
  product_current_stock?: number;
  sub_category_id?: number;
  sub_category_name?: string;
  category_id?: number;
  category_name?: string;
  quantity: number;
  unit_price: number;
  discount_rate?: number;
  subtotal?: string | number;
  tax_rate: number;
  tribute_id?: number;
  is_excluded?: boolean;
  unit_measure_id: number;
  date_create?: string;
  date_update?: string | null;
}

export interface SaleReceipt {
  id_receipt: number;
  name_receipt: string;
  name_sale: string;
  public_url: string;
  date_create: string;
}

export interface Sale {
  id: number;
  reference_code: string;
  establishment_id: number;
  establishment_name: string;
  establishment_address?: string;
  establishment_email?: string;
  establishment_phone?: string;
  customer_id: number;
  customer_name: string;
  customer_identification: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  payment_form_id: number;
  payment_form_code: string;
  payment_form_name: string;
  sale_date: string;
  subtotal: string | number;
  tax_total: string | number;
  total: string | number;
  status: SaleStatus;
  details_count: number;
  receipts_count: number;
  date_create: string;
  date_update: string | null;
  date_delete: string | null;
  active: boolean;
  details?: SaleDetail[];
  receipts?: SaleReceipt[];
}

export interface SaleDetailDTO {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate: number;
  tributeId?: number;
  isExcluded?: boolean;
  unitMeasureId: number;
}

export interface CreateSaleDTO {
  customerId: number;
  paymentFormId: number;
  saleDate?: Date | string;
  details: SaleDetailDTO[];
}

export interface UpdateSaleDTO {
  customerId?: number;
  paymentFormId?: number;
  saleDate?: Date | string;
  details?: SaleDetailDTO[];
}

export interface UpdateSaleStatusDTO {
  status: SaleStatus;
}
