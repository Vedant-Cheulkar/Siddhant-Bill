import { http, HttpResponse } from 'msw';
import type { CustomerResponse } from '@features/customers/types/customer.types';
import type { ProductResponse } from '@features/item-groups/types/product.types';
import type { InvoiceDetailResponse, InvoiceSummaryResponse, InvoiceStatus } from '@features/invoices/types/invoice.types';
import type { WorkOrderResponse, WorkOrderSummaryResponse, WorkOrderStatus } from '@features/work-orders/types/workOrder.types';
import {
  SEED_CUSTOMERS,
  SEED_PRODUCTS,
  SEED_INVOICES,
  SEED_WORK_ORDERS,
  YEARLY_STATS,
} from './demo-data';

/* ── In-memory stores (mutable) ───────────────────────────────── */
let customers: CustomerResponse[]      = structuredClone(SEED_CUSTOMERS);
let products:  ProductResponse[]       = structuredClone(SEED_PRODUCTS);
let invoices:  InvoiceDetailResponse[] = structuredClone(SEED_INVOICES);
let workOrders: WorkOrderResponse[]    = structuredClone(SEED_WORK_ORDERS);

let orgSettings = {
  company: {
    name: 'Siddhant Logistics',
    gstin: '27AABCS1234F1Z5',
    pan: 'AABCS1234F',
    address: 'Plot 12, MIDC Industrial Area',
    city: 'Pune',
    stateCode: '27',
    phone: '9822012345',
    email: 'billing@siddhantlogistics.com',
  },
  invoice: {
    prefix: 'SL',
    startingNumber: 1,
    defaultDueDays: 30,
    terms:
      'Payment due within 30 days of invoice date. Late payments may attract 2% per month interest.',
  },
  tax: {
    defaultRate: 18,
  },
};

/* ── Helpers ──────────────────────────────────────────────────── */
const uid = () => crypto.randomUUID();
const ts  = () => new Date().toISOString();

function page<T>(items: T[], p: number, sz: number) {
  const total = items.length;
  const start = p * sz;
  return {
    content: items.slice(start, start + sz),
    page: p,
    size: sz,
    totalElements: total,
    totalPages: Math.max(1, Math.ceil(total / sz)),
    last: start + sz >= total,
  };
}

function sp(req: Request) {
  return new URL(req.url).searchParams;
}

function toSummary(inv: InvoiceDetailResponse): InvoiceSummaryResponse {
  return {
    id: inv.id,
    displayNumber: inv.displayNumber,
    status: inv.status,
    customerId: inv.customerId,
    invoiceDate: inv.invoiceDate,
    grandTotal: inv.grandTotal,
    createdAt: inv.createdAt,
  };
}

function toWoSummary(wo: WorkOrderResponse): WorkOrderSummaryResponse {
  return {
    id: wo.id,
    orderNumber: wo.orderNumber,
    status: wo.status,
    customerId: wo.customerId,
    serviceDate: wo.serviceDate,
    grandTotal: wo.grandTotal,
    vehicleRef: wo.vehicleRef,
    createdAt: wo.createdAt,
  };
}

const BASE = '/api/v1';

/* ── Handlers ─────────────────────────────────────────────────── */
export const demoHandlers = [

  /* ── Auth ── */
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ data: { accessToken: 'demo-token', refreshToken: 'demo-refresh', expiresIn: 86400 } })
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({
      data: {
        id: 'dev-user',
        email: 'admin@siddhant.local',
        fullName: 'Siddhant Admin',
        tenantId: 'demo-tenant',
        organizationId: 'demo-org',
        roles: ['ADMIN'],
        permissions: [],
      },
    })
  ),

  /* ── Customers ── */
  http.get(`${BASE}/customers`, ({ request }) => {
    const s   = sp(request);
    const q   = (s.get('q') ?? '').toLowerCase();
    const p   = Number(s.get('page') ?? 0);
    const sz  = Number(s.get('size') ?? 20);
    const active = s.get('isActive');

    let list = customers;
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    if (active === 'true')  list = list.filter(c => c.active);
    if (active === 'false') list = list.filter(c => !c.active);

    return HttpResponse.json({ data: page(list, p, sz) });
  }),

  http.get(`${BASE}/customers/lookup`, () =>
    HttpResponse.json({
      data: customers.map((c) => ({ id: c.id, name: c.name })),
    }),
  ),

  http.get(`${BASE}/customers/:id`, ({ params }) => {
    const c = customers.find(x => x.id === params.id);
    if (!c) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: c });
  }),

  http.post(`${BASE}/customers`, async ({ request }) => {
    const body = await request.json() as Partial<CustomerResponse>;
    const now  = ts();
    const created: CustomerResponse = {
      id: uid(), code: body.code ?? '', name: body.name ?? '',
      gstin: body.gstin, pan: body.pan,
      email: body.email, phone: body.phone,
      billingStateCode: body.billingStateCode ?? '27',
      creditDays: body.creditDays ?? 30,
      active: body.active ?? true,
      notes: body.notes,
      createdAt: now, updatedAt: now,
    };
    customers = [created, ...customers];
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.put(`${BASE}/customers/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<CustomerResponse>;
    const idx  = customers.findIndex(x => x.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    customers[idx] = { ...customers[idx], ...body, id: params.id as string, updatedAt: ts() };
    return HttpResponse.json({ data: customers[idx] });
  }),

  http.delete(`${BASE}/customers/:id`, ({ params }) => {
    customers = customers.filter(x => x.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  /* ── Products ── */
  http.get(`${BASE}/products`, ({ request }) => {
    const s  = sp(request);
    const q  = (s.get('q') ?? '').toLowerCase();
    const p  = Number(s.get('page') ?? 0);
    const sz = Number(s.get('size') ?? 20);

    let list = products;
    if (q) list = list.filter(r => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q));

    return HttpResponse.json({ data: page(list, p, sz) });
  }),

  http.get(`${BASE}/products/:id`, ({ params }) => {
    const r = products.find(x => x.id === params.id);
    if (!r) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: r });
  }),

  http.post(`${BASE}/products`, async ({ request }) => {
    const body = await request.json() as Partial<ProductResponse>;
    const now  = ts();
    const created: ProductResponse = {
      id: uid(), sku: body.sku ?? '', name: body.name ?? '',
      description: body.description, hsnSac: body.hsnSac,
      salePrice: body.salePrice ?? 0,
      active: body.active ?? true,
      createdAt: now, updatedAt: now,
    };
    products = [created, ...products];
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.put(`${BASE}/products/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<ProductResponse>;
    const idx  = products.findIndex(x => x.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    products[idx] = { ...products[idx], ...body, id: params.id as string, updatedAt: ts() };
    return HttpResponse.json({ data: products[idx] });
  }),

  http.delete(`${BASE}/products/:id`, ({ params }) => {
    products = products.filter(x => x.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  /* ── Invoices ── */
  http.get(`${BASE}/invoices`, ({ request }) => {
    const s      = sp(request);
    const status = s.get('status') as InvoiceStatus | null;
    const q      = (s.get('q') ?? '').toLowerCase();
    const p      = Number(s.get('page') ?? 0);
    const sz     = Number(s.get('size') ?? 20);

    let list = invoices;
    if (status) list = list.filter(i => i.status === status);
    if (q)      list = list.filter(i =>
      i.displayNumber.toLowerCase().includes(q) ||
      (i.customerName ?? '').toLowerCase().includes(q)
    );
    // sort newest first
    list = [...list].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));

    return HttpResponse.json({ data: page(list.map(toSummary), p, sz) });
  }),

  http.get(`${BASE}/invoices/:id`, ({ params }) => {
    const inv = invoices.find(x => x.id === params.id);
    if (!inv) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: inv });
  }),

  http.post(`${BASE}/invoices`, async ({ request }) => {
    const body = await request.json() as Partial<InvoiceDetailResponse>;
    const now  = ts();
    const cust = customers.find(c => c.id === body.customerId);
    const num  = `SL-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const items = (body.items ?? []).map((it, i) => ({
      ...it,
      id: `li-new-${i}`,
      lineTotal: it.quantity * it.unitPrice * (1 + it.taxPercent / 100) * (1 - (it.discountPercent ?? 0) / 100),
    }));
    const created: InvoiceDetailResponse = {
      id: uid(),
      displayNumber: num,
      status: 'DRAFT',
      customerId: body.customerId ?? '',
      customerName: cust?.name,
      invoiceDate: body.invoiceDate ?? now.slice(0, 10),
      dueDate: body.dueDate,
      currency: 'INR',
      documentType: body.documentType ?? 'TAX_INVOICE',
      reverseCharge: body.reverseCharge ?? false,
      grandTotal: items.reduce((s, i) => s + i.lineTotal, 0),
      notes: body.notes,
      items,
      createdAt: now, updatedAt: now,
    };
    invoices = [created, ...invoices];
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.put(`${BASE}/invoices/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<InvoiceDetailResponse>;
    const idx  = invoices.findIndex(x => x.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const cust = customers.find(c => c.id === body.customerId);
    const items = (body.items ?? invoices[idx].items).map((it, i) => ({
      ...it,
      id: it.id ?? `li-upd-${i}`,
      lineTotal: it.quantity * it.unitPrice * (1 + it.taxPercent / 100) * (1 - (it.discountPercent ?? 0) / 100),
    }));
    invoices[idx] = {
      ...invoices[idx], ...body,
      id: params.id as string,
      customerName: cust?.name ?? invoices[idx].customerName,
      items,
      grandTotal: items.reduce((s, i) => s + i.lineTotal, 0),
      updatedAt: ts(),
    };
    return HttpResponse.json({ data: invoices[idx] });
  }),

  http.patch(`${BASE}/invoices/:id/status`, async ({ params, request }) => {
    const body = await request.json() as { status: InvoiceStatus };
    const idx  = invoices.findIndex(x => x.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    invoices[idx] = { ...invoices[idx], status: body.status, updatedAt: ts() };
    return HttpResponse.json({ data: invoices[idx] });
  }),

  http.delete(`${BASE}/invoices/:id`, ({ params }) => {
    invoices = invoices.filter(x => x.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  /* ── Work Orders ── */
  http.get(`${BASE}/work-orders`, ({ request }) => {
    const s      = sp(request);
    const status = s.get('status') as WorkOrderStatus | null;
    const q      = (s.get('q') ?? '').toLowerCase();
    const p      = Number(s.get('page') ?? 0);
    const sz     = Number(s.get('size') ?? 20);

    let list = workOrders;
    if (status) list = list.filter(w => w.status === status);
    if (q)      list = list.filter(w =>
      w.orderNumber.toLowerCase().includes(q) ||
      (w.customerName ?? '').toLowerCase().includes(q) ||
      (w.vehicleRef ?? '').toLowerCase().includes(q)
    );
    list = [...list].sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));

    return HttpResponse.json({ data: page(list.map(toWoSummary), p, sz) });
  }),

  http.get(`${BASE}/work-orders/:id`, ({ params }) => {
    const wo = workOrders.find(x => x.id === params.id);
    if (!wo) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: wo });
  }),

  http.post(`${BASE}/work-orders`, async ({ request }) => {
    const body = await request.json() as Partial<WorkOrderResponse>;
    const now  = ts();
    const cust = customers.find(c => c.id === body.customerId);
    const num  = `WO-2026-${String(workOrders.length + 1).padStart(3, '0')}`;
    const items = (body.items ?? []).map((it, i) => ({
      ...it,
      id: `wli-new-${i}`,
      lineTotal: it.quantity * it.unitPrice * (1 + it.taxPercent / 100) * (1 - (it.discountPercent ?? 0) / 100),
    }));
    const created: WorkOrderResponse = {
      id: uid(),
      orderNumber: num,
      status: 'OPEN',
      customerId: body.customerId ?? '',
      customerName: cust?.name,
      vehicleRef: body.vehicleRef,
      serviceDate: body.serviceDate ?? now.slice(0, 10),
      description: body.description,
      notes: body.notes,
      grandTotal: items.reduce((s, i) => s + i.lineTotal, 0),
      items,
      createdAt: now, updatedAt: now,
    };
    workOrders = [created, ...workOrders];
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.put(`${BASE}/work-orders/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<WorkOrderResponse>;
    const idx  = workOrders.findIndex(x => x.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const cust  = customers.find(c => c.id === body.customerId);
    const items = (body.items ?? workOrders[idx].items).map((it, i) => ({
      ...it,
      id: it.id ?? `wli-upd-${i}`,
      lineTotal: it.quantity * it.unitPrice * (1 + it.taxPercent / 100) * (1 - (it.discountPercent ?? 0) / 100),
    }));
    workOrders[idx] = {
      ...workOrders[idx], ...body,
      id: params.id as string,
      customerName: cust?.name ?? workOrders[idx].customerName,
      items,
      grandTotal: items.reduce((s, i) => s + i.lineTotal, 0),
      updatedAt: ts(),
    };
    return HttpResponse.json({ data: workOrders[idx] });
  }),

  http.patch(`${BASE}/work-orders/:id/status`, async ({ params, request }) => {
    const body = await request.json() as { status: WorkOrderStatus };
    const idx  = workOrders.findIndex(x => x.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    workOrders[idx] = { ...workOrders[idx], status: body.status, updatedAt: ts() };
    return HttpResponse.json({ data: workOrders[idx] });
  }),

  http.delete(`${BASE}/work-orders/:id`, ({ params }) => {
    workOrders = workOrders.filter(x => x.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  /* ── Reports ── */
  http.get(`${BASE}/reports/dashboard`, ({ request }) => {
    const s        = sp(request);
    const fromDate = s.get('fromDate') ?? '';
    const year     = fromDate ? fromDate.slice(0, 4) : String(new Date().getFullYear());
    const stats    = YEARLY_STATS[year] ?? { issued: 0, draft: 0, cancelled: 0, total: 0 };
    return HttpResponse.json({
      data: {
        fromDate: fromDate || `${year}-01-01`,
        toDate:   s.get('toDate') ?? `${year}-12-31`,
        issuedInvoiceCount:    stats.issued,
        draftInvoiceCount:     stats.draft,
        cancelledInvoiceCount: stats.cancelled,
        grandTotal:            stats.total,
      },
    });
  }),

  http.get(`${BASE}/reports/yearly-trend`, () =>
    HttpResponse.json({ data: [] })
  ),

  /* ── Settings ── */
  http.get(`${BASE}/settings`, () =>
    HttpResponse.json({ data: orgSettings }),
  ),

  http.put(`${BASE}/settings`, async ({ request }) => {
    const body = (await request.json()) as Partial<typeof orgSettings>;
    orgSettings = {
      company: { ...orgSettings.company, ...body.company },
      invoice: { ...orgSettings.invoice, ...body.invoice },
      tax: { ...orgSettings.tax, ...body.tax },
    };
    return HttpResponse.json({ data: orgSettings });
  }),
];
