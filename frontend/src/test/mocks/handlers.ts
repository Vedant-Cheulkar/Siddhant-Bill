import { http, HttpResponse } from 'msw';

const BASE = '/api/v1';

export const handlers = [
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ data: { accessToken: 'test-token', refreshToken: 'refresh-token', expiresIn: 3600 } })
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({
      data: {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        roles: ['ADMIN'],
        permissions: [],
      },
    })
  ),

  http.get(`${BASE}/invoices`, () =>
    HttpResponse.json({
      data: {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    })
  ),

  http.get(`${BASE}/customers`, () =>
    HttpResponse.json({
      data: {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    })
  ),

  http.get(`${BASE}/products`, () =>
    HttpResponse.json({
      data: {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    })
  ),

  http.get(`${BASE}/reports/dashboard`, () =>
    HttpResponse.json({
      data: {
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        issuedInvoiceCount: 0,
        draftInvoiceCount: 0,
        cancelledInvoiceCount: 0,
        grandTotal: 0,
      },
    })
  ),

  http.get(`${BASE}/reports/yearly-trend`, () =>
    HttpResponse.json({ data: [] })
  ),

  http.get(`${BASE}/work-orders`, () =>
    HttpResponse.json({
      data: {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    })
  ),

  http.post(`${BASE}/work-orders`, () =>
    HttpResponse.json({
      data: {
        id: 'wo-1',
        orderNumber: 'WO-2026-001',
        status: 'OPEN',
        customerId: 'cust-1',
        serviceDate: '2026-05-22',
        grandTotal: 0,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  ),
];
