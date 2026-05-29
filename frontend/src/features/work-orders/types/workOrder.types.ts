export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'CANCELLED';

export interface WorkOrderItemRequest {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
}

export interface WorkOrderItemResponse {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
  lineTotal: number;
}

export interface WorkOrderRequest {
  customerId: string;
  vehicleRef?: string;
  serviceDate: string;
  description?: string;
  notes?: string;
  items: WorkOrderItemRequest[];
}

export interface WorkOrderResponse {
  id: string;
  orderNumber: string;
  status: WorkOrderStatus;
  customerId: string;
  customerName?: string;
  vehicleRef?: string;
  serviceDate: string;
  grandTotal: number;
  description?: string;
  notes?: string;
  items: WorkOrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderSummaryResponse {
  id: string;
  orderNumber: string;
  status: WorkOrderStatus;
  customerId: string;
  serviceDate: string;
  grandTotal: number;
  vehicleRef?: string;
  createdAt: string;
}
