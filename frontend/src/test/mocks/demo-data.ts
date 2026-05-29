import type { CustomerResponse } from '@features/customers/types/customer.types';
import type { ProductResponse } from '@features/item-groups/types/product.types';
import type { InvoiceDetailResponse } from '@features/invoices/types/invoice.types';
import type { WorkOrderResponse } from '@features/work-orders/types/workOrder.types';

const now = new Date().toISOString();
const d = (s: string) => `${s}T10:00:00Z`;

/* ─── Customers ───────────────────────────────────────────────── */
export const SEED_CUSTOMERS: CustomerResponse[] = [
  {
    id: 'cust-1', code: 'MARUTRANS', name: 'Maruti Transport Co.',
    gstin: '27AABCM1234F1Z5', pan: 'AABCM1234F',
    email: 'accounts@marutitransport.com', phone: '9820111222',
    billingStateCode: '27', creditDays: 30, active: true,
    notes: 'Fleet of 45 trucks — regular monthly maintenance contract',
    createdAt: d('2026-01-05'), updatedAt: d('2026-01-05'),
  },
  {
    id: 'cust-2', code: 'BHARTLOG', name: 'Bharti Logistics Pvt Ltd',
    gstin: '27AADCB5678G1Z3', pan: 'AADCB5678G',
    email: 'finance@bhartilogistics.in', phone: '9821333444',
    billingStateCode: '27', creditDays: 45, active: true,
    notes: 'Long-haul fleet, requires heavy-duty parts',
    createdAt: d('2026-01-10'), updatedAt: d('2026-01-10'),
  },
  {
    id: 'cust-3', code: 'RELIFREIGHT', name: 'Reliance Freight Solutions',
    gstin: '24AABCR9012H1Z2', pan: 'AABCR9012H',
    email: 'billing@reliancefreight.com', phone: '9922555666',
    billingStateCode: '24', creditDays: 30, active: true,
    notes: 'Gujarat-based client — IGST applicable',
    createdAt: d('2026-01-15'), updatedAt: d('2026-01-15'),
  },
  {
    id: 'cust-4', code: 'TATAFLEET', name: 'Tata Fleet Services Ltd',
    gstin: '27AADCT3456I1Z8', pan: 'AADCT3456I',
    email: 'maintenance@tatafleet.com', phone: '9823777888',
    billingStateCode: '27', creditDays: 60, active: true,
    notes: 'Premium client — 120+ commercial vehicles across Maharashtra',
    createdAt: d('2026-01-20'), updatedAt: d('2026-01-20'),
  },
  {
    id: 'cust-5', code: 'KIRTIKARGO', name: 'Kirti Cargo Services',
    gstin: '27AABCK7890J1Z1', pan: 'AABCK7890J',
    email: 'info@kirticargo.com', phone: '9824999000',
    billingStateCode: '27', creditDays: 30, active: true,
    notes: 'Small fleet — 12 trucks, Pune region',
    createdAt: d('2026-02-01'), updatedAt: d('2026-02-01'),
  },
  {
    id: 'cust-6', code: 'SUPREMETRANS', name: 'Supreme Transport Corp',
    gstin: '08AABCS2345K1Z6', pan: 'AABCS2345K',
    email: 'accounts@supremetransport.co.in', phone: '9414111222',
    billingStateCode: '08', creditDays: 30, active: true,
    notes: 'Rajasthan-based — periodic service visits to our yard',
    createdAt: d('2026-02-10'), updatedAt: d('2026-02-10'),
  },
  {
    id: 'cust-7', code: 'ASHOKFLT', name: 'Ashok Leyland Fleet Mgmt',
    gstin: '33AADCA6789L1Z4', pan: 'AADCA6789L',
    email: 'fleet@ashokleyland-mgmt.com', phone: '9444333222',
    billingStateCode: '33', creditDays: 45, active: true,
    notes: 'Pan-India fleet management — high volume, priority client',
    createdAt: d('2026-02-15'), updatedAt: d('2026-02-15'),
  },
  {
    id: 'cust-8', code: 'SWIFTMOVE', name: 'Swift Move Logistics',
    gstin: '27AABCS9012M1Z9', pan: 'AABCS9012M',
    email: 'ops@swiftmove.in', phone: '9825444555',
    billingStateCode: '27', creditDays: 15, active: false,
    notes: 'Inactive — contract ended April 2026',
    createdAt: d('2026-03-01'), updatedAt: d('2026-04-01'),
  },
];

/* ─── Products ────────────────────────────────────────────────── */
export const SEED_PRODUCTS: ProductResponse[] = [
  { id: 'prod-1',  sku: 'SVC-OIL',   name: 'Engine Oil Change',                     description: 'Drain, flush and refill with 15W-40 diesel oil',                hsnSac: '998814',       salePrice: 2500,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-2',  sku: 'SVC-BRK',   name: 'Brake Inspection & Pad Replacement',    description: 'Full brake system check, replace pads and adjust',               hsnSac: '998814',       salePrice: 4500,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-3',  sku: 'SVC-TYR',   name: 'Tyre Fitting & Balancing',              description: 'Remove, fit and balance one tyre (parts billed separately)',     hsnSac: '998814',       salePrice: 1200,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-4',  sku: 'SVC-ENG',   name: 'Engine Tune-up',                        description: 'Injector clean, throttle body service, spark plugs',            hsnSac: '998814',       salePrice: 8500,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-5',  sku: 'SVC-FILT',  name: 'Filter Replacement (Air + Oil)',        description: 'Replace air filter and oil filter together',                     hsnSac: '998814',       salePrice: 1800,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-6',  sku: 'SVC-COOL',  name: 'Coolant Flush & Refill',                description: 'Drain old coolant, system flush, refill with OEM-spec coolant', hsnSac: '998814',       salePrice: 2200,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-7',  sku: 'SVC-BAT',   name: 'Battery Testing & Replacement',         description: 'Load test, replace if below spec (battery part billed extra)',   hsnSac: '998814',       salePrice: 500,   active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-8',  sku: 'SVC-TRANS', name: 'Transmission Service',                  description: 'Fluid drain, filter clean, refill with ATF',                     hsnSac: '998814',       salePrice: 12000, active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-9',  sku: 'PART-PAD',  name: 'Brake Pad Set (Axle)',                  description: 'Heavy-duty brake pads for front or rear axle',                   hsnSac: '8708300000',   salePrice: 2800,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-10', sku: 'PART-TYR',  name: 'Truck Tyre 10R20',                      description: 'Radial truck tyre 10R20, load index 146/143K',                   hsnSac: '4011200090',   salePrice: 18500, active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-11', sku: 'PART-OIL',  name: 'Engine Oil 20L (15W-40)',               description: 'JASO DH-2 diesel engine oil, 20-litre drum',                     hsnSac: '2710199900',   salePrice: 3200,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-12', sku: 'PART-FILT', name: 'Air Filter (Heavy Duty)',               description: 'OEM-compatible dry-type air filter for commercial trucks',       hsnSac: '8421230090',   salePrice: 850,   active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-13', sku: 'PART-BELT', name: 'Drive Belt Kit',                        description: 'Alternator + A/C compressor drive belt set',                     hsnSac: '4010190090',   salePrice: 1400,  active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-14', sku: 'SVC-WASH',  name: 'Full Vehicle Wash & Sanitize',          description: 'Pressure wash, underbody clean, cabin sanitization',             hsnSac: '999721',       salePrice: 600,   active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
  { id: 'prod-15', sku: 'SVC-WELD',  name: 'Welding & Body Repair (per hr)',        description: 'MIG/TIG welding, dent repair, structural bodywork — hourly',     hsnSac: '998714',       salePrice: 750,   active: true,  createdAt: d('2026-01-01'), updatedAt: d('2026-01-01') },
];

/* ─── Invoices ────────────────────────────────────────────────── */
export const SEED_INVOICES: InvoiceDetailResponse[] = [
  {
    id: 'inv-1', displayNumber: 'SL-2026-001', status: 'ISSUED',
    customerId: 'cust-1', customerName: 'Maruti Transport Co.',
    invoiceDate: '2026-01-10', dueDate: '2026-02-09', currency: 'INR',
    grandTotal: 35400,
    notes: 'Scheduled Jan maintenance — 4 trucks',
    items: [
      { id: 'li-1-1', productId: 'prod-1',  description: 'Engine Oil Change',           quantity: 4, unitPrice: 2500, taxPercent: 18, discountPercent: 0, lineTotal: 11800 },
      { id: 'li-1-2', productId: 'prod-5',  description: 'Filter Replacement (Air+Oil)', quantity: 4, unitPrice: 1800, taxPercent: 18, discountPercent: 0, lineTotal: 8496  },
      { id: 'li-1-3', productId: 'prod-11', description: 'Engine Oil 20L (15W-40)',      quantity: 4, unitPrice: 3200, taxPercent: 18, discountPercent: 0, lineTotal: 15104 },
    ],
    createdAt: d('2026-01-10'), updatedAt: d('2026-01-10'),
  },
  {
    id: 'inv-2', displayNumber: 'SL-2026-002', status: 'ISSUED',
    customerId: 'cust-2', customerName: 'Bharti Logistics Pvt Ltd',
    invoiceDate: '2026-01-18', dueDate: '2026-03-04', currency: 'INR',
    grandTotal: 51684,
    notes: 'Brake overhaul — 6 long-haul trucks',
    items: [
      { id: 'li-2-1', productId: 'prod-2', description: 'Brake Inspection & Pad Replacement', quantity: 6, unitPrice: 4500, taxPercent: 18, discountPercent: 0, lineTotal: 31860 },
      { id: 'li-2-2', productId: 'prod-9', description: 'Brake Pad Set (Axle)',                quantity: 6, unitPrice: 2800, taxPercent: 18, discountPercent: 0, lineTotal: 19824 },
    ],
    createdAt: d('2026-01-18'), updatedAt: d('2026-01-18'),
  },
  {
    id: 'inv-3', displayNumber: 'SL-2026-003', status: 'ISSUED',
    customerId: 'cust-4', customerName: 'Tata Fleet Services Ltd',
    invoiceDate: '2026-01-25', dueDate: '2026-03-25', currency: 'INR',
    grandTotal: 110448,
    notes: 'Full fleet tune-up — 8 vehicles',
    items: [
      { id: 'li-3-1', productId: 'prod-4',  description: 'Engine Tune-up',              quantity: 8, unitPrice: 8500, taxPercent: 18, discountPercent: 0, lineTotal: 80240 },
      { id: 'li-3-2', productId: 'prod-5',  description: 'Filter Replacement (Air+Oil)', quantity: 8, unitPrice: 1800, taxPercent: 18, discountPercent: 0, lineTotal: 16992 },
      { id: 'li-3-3', productId: 'prod-13', description: 'Drive Belt Kit',               quantity: 8, unitPrice: 1400, taxPercent: 18, discountPercent: 0, lineTotal: 13216 },
    ],
    createdAt: d('2026-01-25'), updatedAt: d('2026-01-25'),
  },
  {
    id: 'inv-4', displayNumber: 'SL-2026-004', status: 'ISSUED',
    customerId: 'cust-3', customerName: 'Reliance Freight Solutions',
    invoiceDate: '2026-02-05', dueDate: '2026-03-07', currency: 'INR',
    grandTotal: 27966,
    notes: 'Quarterly service — 3 vehicles (IGST)',
    items: [
      { id: 'li-4-1', productId: 'prod-1',  description: 'Engine Oil Change',       quantity: 3, unitPrice: 2500, taxPercent: 18, discountPercent: 0, lineTotal: 8850  },
      { id: 'li-4-2', productId: 'prod-6',  description: 'Coolant Flush & Refill',  quantity: 3, unitPrice: 2200, taxPercent: 18, discountPercent: 0, lineTotal: 7788  },
      { id: 'li-4-3', productId: 'prod-11', description: 'Engine Oil 20L (15W-40)', quantity: 3, unitPrice: 3200, taxPercent: 18, discountPercent: 0, lineTotal: 11328 },
    ],
    createdAt: d('2026-02-05'), updatedAt: d('2026-02-05'),
  },
  {
    id: 'inv-5', displayNumber: 'SL-2026-005', status: 'ISSUED',
    customerId: 'cust-1', customerName: 'Maruti Transport Co.',
    invoiceDate: '2026-02-12', dueDate: '2026-03-14', currency: 'INR',
    grandTotal: 186008,
    notes: 'Tyre replacement — full fleet rotation (8 trucks × 2 tyres)',
    items: [
      { id: 'li-5-1', productId: 'prod-3',  description: 'Tyre Fitting & Balancing', quantity: 16, unitPrice: 1200,  taxPercent: 18, discountPercent: 0, lineTotal: 22656  },
      { id: 'li-5-2', productId: 'prod-10', description: 'Truck Tyre 10R20',          quantity: 16, unitPrice: 18500, taxPercent: 18, discountPercent: 5, lineTotal: 330936 },
    ],
    createdAt: d('2026-02-12'), updatedAt: d('2026-02-12'),
  },
  {
    id: 'inv-6', displayNumber: 'SL-2026-006', status: 'ISSUED',
    customerId: 'cust-5', customerName: 'Kirti Cargo Services',
    invoiceDate: '2026-03-08', dueDate: '2026-04-07', currency: 'INR',
    grandTotal: 8496,
    notes: 'Routine service — 2 trucks',
    items: [
      { id: 'li-6-1', productId: 'prod-1',  description: 'Engine Oil Change',           quantity: 2, unitPrice: 2500, taxPercent: 18, discountPercent: 0, lineTotal: 5900 },
      { id: 'li-6-2', productId: 'prod-14', description: 'Full Vehicle Wash & Sanitize', quantity: 2, unitPrice: 600,  taxPercent: 18, discountPercent: 0, lineTotal: 1416 },
      { id: 'li-6-3', productId: 'prod-7',  description: 'Battery Testing',              quantity: 2, unitPrice: 500,  taxPercent: 18, discountPercent: 0, lineTotal: 1180 },
    ],
    createdAt: d('2026-03-08'), updatedAt: d('2026-03-08'),
  },
  {
    id: 'inv-7', displayNumber: 'SL-2026-007', status: 'ISSUED',
    customerId: 'cust-6', customerName: 'Supreme Transport Corp',
    invoiceDate: '2026-03-20', dueDate: '2026-04-19', currency: 'INR',
    grandTotal: 38468,
    notes: 'Transmission + routine service — 2 vehicles (IGST)',
    items: [
      { id: 'li-7-1', productId: 'prod-8', description: 'Transmission Service',          quantity: 2, unitPrice: 12000, taxPercent: 18, discountPercent: 0, lineTotal: 28320 },
      { id: 'li-7-2', productId: 'prod-1', description: 'Engine Oil Change',              quantity: 2, unitPrice: 2500,  taxPercent: 18, discountPercent: 0, lineTotal: 5900  },
      { id: 'li-7-3', productId: 'prod-5', description: 'Filter Replacement (Air + Oil)', quantity: 2, unitPrice: 1800,  taxPercent: 18, discountPercent: 0, lineTotal: 4248  },
    ],
    createdAt: d('2026-03-20'), updatedAt: d('2026-03-20'),
  },
  {
    id: 'inv-8', displayNumber: 'SL-2026-008', status: 'DRAFT',
    customerId: 'cust-4', customerName: 'Tata Fleet Services Ltd',
    invoiceDate: '2026-04-05', dueDate: '2026-06-04', currency: 'INR',
    grandTotal: 129800,
    notes: 'Apr major service — 10 vehicles (pending approval)',
    items: [
      { id: 'li-8-1', productId: 'prod-4', description: 'Engine Tune-up',    quantity: 10, unitPrice: 8500, taxPercent: 18, discountPercent: 0, lineTotal: 100300 },
      { id: 'li-8-2', productId: 'prod-1', description: 'Engine Oil Change',  quantity: 10, unitPrice: 2500, taxPercent: 18, discountPercent: 0, lineTotal: 29500  },
    ],
    createdAt: d('2026-04-05'), updatedAt: d('2026-04-05'),
  },
  {
    id: 'inv-9', displayNumber: 'SL-2026-009', status: 'DRAFT',
    customerId: 'cust-2', customerName: 'Bharti Logistics Pvt Ltd',
    invoiceDate: '2026-04-22', dueDate: '2026-06-06', currency: 'INR',
    grandTotal: 34456,
    notes: 'Brake overhaul — 4 trucks (draft, awaiting part confirmation)',
    items: [
      { id: 'li-9-1', productId: 'prod-2', description: 'Brake Inspection & Pad Replacement', quantity: 4, unitPrice: 4500, taxPercent: 18, discountPercent: 0, lineTotal: 21240 },
      { id: 'li-9-2', productId: 'prod-9', description: 'Brake Pad Set (Axle)',                quantity: 4, unitPrice: 2800, taxPercent: 18, discountPercent: 0, lineTotal: 13216 },
    ],
    createdAt: d('2026-04-22'), updatedAt: d('2026-04-22'),
  },
  {
    id: 'inv-10', displayNumber: 'SL-2026-010', status: 'DRAFT',
    customerId: 'cust-7', customerName: 'Ashok Leyland Fleet Mgmt',
    invoiceDate: '2026-05-10', dueDate: '2026-06-24', currency: 'INR',
    grandTotal: 65962,
    notes: 'May service cycle — 5 vehicles + 2 transmissions (IGST)',
    items: [
      { id: 'li-10-1', productId: 'prod-4', description: 'Engine Tune-up',       quantity: 5, unitPrice: 8500,  taxPercent: 18, discountPercent: 0, lineTotal: 50150 },
      { id: 'li-10-2', productId: 'prod-5', description: 'Filter Replacement',    quantity: 5, unitPrice: 1800,  taxPercent: 18, discountPercent: 0, lineTotal: 10620 },
      { id: 'li-10-3', productId: 'prod-6', description: 'Coolant Flush & Refill', quantity: 2, unitPrice: 2200, taxPercent: 18, discountPercent: 0, lineTotal: 5192  },
    ],
    createdAt: d('2026-05-10'), updatedAt: d('2026-05-10'),
  },
  {
    id: 'inv-11', displayNumber: 'SL-2026-011', status: 'CANCELLED',
    customerId: 'cust-5', customerName: 'Kirti Cargo Services',
    invoiceDate: '2026-03-01', dueDate: '2026-03-31', currency: 'INR',
    grandTotal: 5900,
    notes: 'Cancelled — customer requested reschedule',
    items: [
      { id: 'li-11-1', productId: 'prod-1', description: 'Engine Oil Change', quantity: 2, unitPrice: 2500, taxPercent: 18, discountPercent: 0, lineTotal: 5900 },
    ],
    createdAt: d('2026-03-01'), updatedAt: d('2026-03-02'),
  },
  {
    id: 'inv-12', displayNumber: 'SL-2026-012', status: 'CANCELLED',
    customerId: 'cust-8', customerName: 'Swift Move Logistics',
    invoiceDate: '2026-03-15', dueDate: '2026-03-30', currency: 'INR',
    grandTotal: 14160,
    notes: 'Cancelled — client contract terminated',
    items: [
      { id: 'li-12-1', productId: 'prod-8', description: 'Transmission Service', quantity: 1, unitPrice: 12000, taxPercent: 18, discountPercent: 0, lineTotal: 14160 },
    ],
    createdAt: d('2026-03-15'), updatedAt: d('2026-03-16'),
  },
];

/* ─── Work Orders ─────────────────────────────────────────────── */
export const SEED_WORK_ORDERS: WorkOrderResponse[] = [
  {
    id: 'wo-1', orderNumber: 'WO-2026-001', status: 'OPEN',
    customerId: 'cust-1', customerName: 'Maruti Transport Co.',
    vehicleRef: 'MH-12-AB-1234', serviceDate: '2026-05-22',
    description: 'Scheduled oil change + filter for truck MH-12-AB-1234',
    grandTotal: 14160,
    items: [
      { id: 'wli-1-1', productId: 'prod-1',  description: 'Engine Oil Change',       quantity: 2, unitPrice: 2500, taxPercent: 18, discountPercent: 0, lineTotal: 5900  },
      { id: 'wli-1-2', productId: 'prod-11', description: 'Engine Oil 20L (15W-40)', quantity: 2, unitPrice: 3200, taxPercent: 18, discountPercent: 0, lineTotal: 7552  },
      { id: 'wli-1-3', productId: 'prod-5',  description: 'Filter Replacement',      quantity: 2, unitPrice: 1800, taxPercent: 18, discountPercent: 0, lineTotal: 4248  },
    ],
    createdAt: d('2026-05-21'), updatedAt: d('2026-05-21'),
  },
  {
    id: 'wo-2', orderNumber: 'WO-2026-002', status: 'OPEN',
    customerId: 'cust-2', customerName: 'Bharti Logistics Pvt Ltd',
    vehicleRef: 'MH-14-CD-5678', serviceDate: '2026-05-23',
    description: 'Brake inspection requested — pulling to left reported by driver',
    grandTotal: 18880,
    items: [
      { id: 'wli-2-1', productId: 'prod-2', description: 'Brake Inspection & Pad Replacement', quantity: 2, unitPrice: 4500, taxPercent: 18, discountPercent: 0, lineTotal: 10620 },
      { id: 'wli-2-2', productId: 'prod-9', description: 'Brake Pad Set (Axle)',                quantity: 2, unitPrice: 2800, taxPercent: 18, discountPercent: 0, lineTotal: 6608  },
      { id: 'wli-2-3', productId: 'prod-14', description: 'Full Vehicle Wash',                  quantity: 1, unitPrice: 600,  taxPercent: 18, discountPercent: 0, lineTotal: 708   },
    ],
    createdAt: d('2026-05-21'), updatedAt: d('2026-05-21'),
  },
  {
    id: 'wo-3', orderNumber: 'WO-2026-003', status: 'IN_PROGRESS',
    customerId: 'cust-4', customerName: 'Tata Fleet Services Ltd',
    vehicleRef: 'MH-01-EF-9012', serviceDate: '2026-05-20',
    description: 'Engine tune-up + transmission — 50,000 km service',
    grandTotal: 49560,
    items: [
      { id: 'wli-3-1', productId: 'prod-4', description: 'Engine Tune-up',        quantity: 1, unitPrice: 8500,  taxPercent: 18, discountPercent: 0, lineTotal: 10030 },
      { id: 'wli-3-2', productId: 'prod-8', description: 'Transmission Service',  quantity: 1, unitPrice: 12000, taxPercent: 18, discountPercent: 0, lineTotal: 14160 },
      { id: 'wli-3-3', productId: 'prod-1', description: 'Engine Oil Change',      quantity: 2, unitPrice: 2500,  taxPercent: 18, discountPercent: 0, lineTotal: 5900  },
      { id: 'wli-3-4', productId: 'prod-6', description: 'Coolant Flush & Refill', quantity: 2, unitPrice: 2200,  taxPercent: 18, discountPercent: 0, lineTotal: 5192  },
      { id: 'wli-3-5', productId: 'prod-13', description: 'Drive Belt Kit',        quantity: 2, unitPrice: 1400,  taxPercent: 18, discountPercent: 0, lineTotal: 3304  },
    ],
    createdAt: d('2026-05-19'), updatedAt: d('2026-05-20'),
  },
  {
    id: 'wo-4', orderNumber: 'WO-2026-004', status: 'IN_PROGRESS',
    customerId: 'cust-5', customerName: 'Kirti Cargo Services',
    vehicleRef: 'MH-43-GH-3456', serviceDate: '2026-05-19',
    description: 'Welding repair on chassis — accident damage assessment',
    grandTotal: 12980,
    items: [
      { id: 'wli-4-1', productId: 'prod-15', description: 'Welding & Body Repair (per hr)', quantity: 8, unitPrice: 750, taxPercent: 18, discountPercent: 0, lineTotal: 7080 },
      { id: 'wli-4-2', productId: 'prod-14', description: 'Full Vehicle Wash & Sanitize',   quantity: 1, unitPrice: 600, taxPercent: 18, discountPercent: 0, lineTotal: 708  },
      { id: 'wli-4-3', productId: 'prod-1',  description: 'Engine Oil Change',              quantity: 2, unitPrice: 2500, taxPercent: 18, discountPercent: 0, lineTotal: 5900 },
    ],
    createdAt: d('2026-05-18'), updatedAt: d('2026-05-19'),
  },
  {
    id: 'wo-5', orderNumber: 'WO-2026-005', status: 'IN_PROGRESS',
    customerId: 'cust-1', customerName: 'Maruti Transport Co.',
    vehicleRef: 'MH-12-IJ-7890', serviceDate: '2026-05-15',
    description: 'Tyre replacement — 4 tyres rear axle, balance + alignment',
    grandTotal: 91476,
    items: [
      { id: 'wli-5-1', productId: 'prod-10', description: 'Truck Tyre 10R20',          quantity: 4, unitPrice: 18500, taxPercent: 18, discountPercent: 5, lineTotal: 83106 },
      { id: 'wli-5-2', productId: 'prod-3',  description: 'Tyre Fitting & Balancing',  quantity: 4, unitPrice: 1200,  taxPercent: 18, discountPercent: 0, lineTotal: 5664  },
      { id: 'wli-5-3', productId: 'prod-14', description: 'Full Vehicle Wash',          quantity: 1, unitPrice: 600,   taxPercent: 18, discountPercent: 0, lineTotal: 708   },
    ],
    createdAt: d('2026-05-14'), updatedAt: d('2026-05-15'),
  },
  {
    id: 'wo-6', orderNumber: 'WO-2026-006', status: 'COMPLETED',
    customerId: 'cust-2', customerName: 'Bharti Logistics Pvt Ltd',
    vehicleRef: 'MH-14-KL-2345', serviceDate: '2026-05-10',
    description: 'Major service — brake overhaul + 6 tyre replacements completed',
    grandTotal: 151956,
    items: [
      { id: 'wli-6-1', productId: 'prod-2',  description: 'Brake Inspection & Pad Replacement', quantity: 2,  unitPrice: 4500,  taxPercent: 18, discountPercent: 0, lineTotal: 10620  },
      { id: 'wli-6-2', productId: 'prod-9',  description: 'Brake Pad Set (Axle)',                quantity: 2,  unitPrice: 2800,  taxPercent: 18, discountPercent: 0, lineTotal: 6608   },
      { id: 'wli-6-3', productId: 'prod-10', description: 'Truck Tyre 10R20',                    quantity: 6,  unitPrice: 18500, taxPercent: 18, discountPercent: 5, lineTotal: 124659 },
      { id: 'wli-6-4', productId: 'prod-3',  description: 'Tyre Fitting & Balancing',            quantity: 6,  unitPrice: 1200,  taxPercent: 18, discountPercent: 0, lineTotal: 8496   },
    ],
    createdAt: d('2026-05-08'), updatedAt: d('2026-05-10'),
  },
  {
    id: 'wo-7', orderNumber: 'WO-2026-007', status: 'COMPLETED',
    customerId: 'cust-3', customerName: 'Reliance Freight Solutions',
    vehicleRef: 'GJ-06-MN-6789', serviceDate: '2026-05-08',
    description: 'Full service — tune-up, coolant, filters for Gujarat fleet visit',
    grandTotal: 27966,
    items: [
      { id: 'wli-7-1', productId: 'prod-4',  description: 'Engine Tune-up',       quantity: 2, unitPrice: 8500, taxPercent: 18, discountPercent: 0, lineTotal: 20060 },
      { id: 'wli-7-2', productId: 'prod-6',  description: 'Coolant Flush & Refill', quantity: 2, unitPrice: 2200, taxPercent: 18, discountPercent: 0, lineTotal: 5192 },
      { id: 'wli-7-3', productId: 'prod-12', description: 'Air Filter (Heavy Duty)', quantity: 3, unitPrice: 850,  taxPercent: 18, discountPercent: 0, lineTotal: 3009 },
    ],
    createdAt: d('2026-05-06'), updatedAt: d('2026-05-08'),
  },
  {
    id: 'wo-8', orderNumber: 'WO-2026-008', status: 'INVOICED',
    customerId: 'cust-4', customerName: 'Tata Fleet Services Ltd',
    vehicleRef: 'MH-01-OP-0123', serviceDate: '2026-04-28',
    description: 'April major service — 8 vehicles, invoiced as SL-2026-003',
    grandTotal: 110448,
    items: [
      { id: 'wli-8-1', productId: 'prod-4',  description: 'Engine Tune-up',                  quantity: 8, unitPrice: 8500, taxPercent: 18, discountPercent: 0, lineTotal: 80240 },
      { id: 'wli-8-2', productId: 'prod-5',  description: 'Filter Replacement (Air + Oil)',   quantity: 8, unitPrice: 1800, taxPercent: 18, discountPercent: 0, lineTotal: 16992 },
      { id: 'wli-8-3', productId: 'prod-13', description: 'Drive Belt Kit',                   quantity: 8, unitPrice: 1400, taxPercent: 18, discountPercent: 0, lineTotal: 13216 },
    ],
    createdAt: d('2026-04-25'), updatedAt: d('2026-04-29'),
  },
  {
    id: 'wo-9', orderNumber: 'WO-2026-009', status: 'INVOICED',
    customerId: 'cust-6', customerName: 'Supreme Transport Corp',
    vehicleRef: 'RJ-14-QR-4567', serviceDate: '2026-04-22',
    description: 'Transmission + routine — Rajasthan fleet visit, invoiced as SL-2026-007',
    grandTotal: 38468,
    items: [
      { id: 'wli-9-1', productId: 'prod-8', description: 'Transmission Service',           quantity: 2, unitPrice: 12000, taxPercent: 18, discountPercent: 0, lineTotal: 28320 },
      { id: 'wli-9-2', productId: 'prod-1', description: 'Engine Oil Change',               quantity: 2, unitPrice: 2500,  taxPercent: 18, discountPercent: 0, lineTotal: 5900  },
      { id: 'wli-9-3', productId: 'prod-5', description: 'Filter Replacement (Air + Oil)',  quantity: 2, unitPrice: 1800,  taxPercent: 18, discountPercent: 0, lineTotal: 4248  },
    ],
    createdAt: d('2026-04-20'), updatedAt: d('2026-04-23'),
  },
  {
    id: 'wo-10', orderNumber: 'WO-2026-010', status: 'CANCELLED',
    customerId: 'cust-8', customerName: 'Swift Move Logistics',
    vehicleRef: 'MH-46-ST-8901', serviceDate: '2026-04-10',
    description: 'Cancelled — client contract terminated before service',
    grandTotal: 7080,
    items: [
      { id: 'wli-10-1', productId: 'prod-1', description: 'Engine Oil Change', quantity: 3, unitPrice: 2500, taxPercent: 18, discountPercent: 0, lineTotal: 8850 },
    ],
    createdAt: d('2026-04-08'), updatedAt: d('2026-04-09'),
  },
];

/* ─── Yearly dashboard data ───────────────────────────────────── */
export const YEARLY_STATS: Record<string, { issued: number; draft: number; cancelled: number; total: number }> = {
  '2022': { issued: 18, draft: 2, cancelled: 3, total: 428500  },
  '2023': { issued: 31, draft: 4, cancelled: 5, total: 712300  },
  '2024': { issued: 47, draft: 6, cancelled: 4, total: 1085600 },
  '2025': { issued: 58, draft: 7, cancelled: 6, total: 1342800 },
  '2026': { issued: 7,  draft: 3, cancelled: 2, total: 458470  },
};

void now; // suppress unused warning
