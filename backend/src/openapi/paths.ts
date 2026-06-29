import { parameters } from './schemas.js';

const bearer = [{ BearerAuth: [] as string[] }];
const json = 'application/json';
const err = { $ref: '#/components/schemas/ErrorMessage' };

function ok(schema: object) {
  return {
    description: 'Success',
    content: {
      [json]: {
        schema: {
          type: 'object',
          properties: {
            data: schema,
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
          required: ['data', 'timestamp'],
        },
      },
    },
  };
}

function pageOf(itemRef: string) {
  return ok({
    allOf: [
      { $ref: '#/components/schemas/PageResult' },
      {
        type: 'object',
        properties: {
          content: { type: 'array', items: { $ref: itemRef } },
        },
      },
    ],
  });
}

export const paths = {
  '/actuator/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      responses: {
        200: {
          description: 'Service healthy',
          content: { [json]: { schema: { $ref: '#/components/schemas/HealthResponse' } } },
        },
        503: { description: 'Database unavailable', content: { [json]: { schema: err } } },
      },
    },
  },

  '/api/v1/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Sign in',
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/LoginRequest' } } },
      },
      responses: {
        200: ok({ $ref: '#/components/schemas/TokenResponse' }),
        401: { description: 'Invalid credentials', content: { [json]: { schema: err } } },
        429: { description: 'Too many attempts', content: { [json]: { schema: err } } },
      },
    },
  },
  '/api/v1/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Current user profile',
      security: bearer,
      responses: {
        200: ok({ $ref: '#/components/schemas/AuthProfile' }),
        401: { description: 'Unauthorized', content: { [json]: { schema: err } } },
      },
    },
  },
  '/api/v1/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/RefreshRequest' } } },
      },
      responses: {
        200: ok({ $ref: '#/components/schemas/TokenResponse' }),
        401: { description: 'Invalid refresh token', content: { [json]: { schema: err } } },
      },
    },
  },
  '/api/v1/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Sign out (revoke refresh token)',
      security: bearer,
      requestBody: {
        content: {
          [json]: {
            schema: {
              type: 'object',
              properties: { refreshToken: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        200: ok({ type: 'null', nullable: true }),
        401: { description: 'Unauthorized', content: { [json]: { schema: err } } },
      },
    },
  },
  '/api/v1/auth/change-password': {
    post: {
      tags: ['Auth'],
      summary: 'Change password',
      security: bearer,
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } },
      },
      responses: {
        200: ok({ type: 'null', nullable: true }),
        400: { description: 'Validation error', content: { [json]: { schema: err } } },
        401: { description: 'Unauthorized', content: { [json]: { schema: err } } },
      },
    },
  },
  '/api/v1/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Request password reset link',
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } },
      },
      responses: {
        200: ok({
          type: 'object',
          properties: {
            message: { type: 'string' },
            resetUrl: { type: 'string', format: 'uri' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        }),
      },
    },
  },
  '/api/v1/auth/reset-password': {
    post: {
      tags: ['Auth'],
      summary: 'Reset password with token',
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } },
      },
      responses: {
        200: ok({ type: 'null', nullable: true }),
        400: { description: 'Invalid or expired token', content: { [json]: { schema: err } } },
      },
    },
  },

  '/api/v1/users': {
    get: {
      tags: ['Users'],
      summary: 'List organization users',
      security: bearer,
      responses: {
        200: ok({ type: 'array', items: { $ref: '#/components/schemas/User' } }),
        403: { description: 'Forbidden', content: { [json]: { schema: err } } },
      },
    },
    post: {
      tags: ['Users'],
      summary: 'Create user (admin)',
      security: bearer,
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/CreateUserRequest' } } },
      },
      responses: {
        201: ok({ $ref: '#/components/schemas/User' }),
        409: { description: 'Email already exists', content: { [json]: { schema: err } } },
      },
    },
  },
  '/api/v1/users/{id}': {
    patch: {
      tags: ['Users'],
      summary: 'Update user (admin)',
      security: bearer,
      parameters: [parameters.id],
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } },
      },
      responses: {
        200: ok({ $ref: '#/components/schemas/User' }),
        404: { description: 'Not found', content: { [json]: { schema: err } } },
      },
    },
  },

  '/api/v1/customers': {
    get: {
      tags: ['Customers'],
      summary: 'List customers (paginated)',
      security: bearer,
      parameters: [
        parameters.page,
        parameters.size,
        { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search name or code' },
        { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
      ],
      responses: { 200: pageOf('#/components/schemas/Customer') },
    },
    post: {
      tags: ['Customers'],
      summary: 'Create customer',
      security: bearer,
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/CustomerInput' } } },
      },
      responses: { 201: ok({ $ref: '#/components/schemas/Customer' }) },
    },
  },
  '/api/v1/customers/lookup': {
    get: {
      tags: ['Customers'],
      summary: 'Customer id/name lookup',
      security: bearer,
      responses: {
        200: ok({ type: 'array', items: { $ref: '#/components/schemas/CustomerLookup' } }),
      },
    },
  },
  '/api/v1/customers/{id}': {
    get: {
      tags: ['Customers'],
      summary: 'Get customer',
      security: bearer,
      parameters: [parameters.id],
      responses: {
        200: ok({ $ref: '#/components/schemas/Customer' }),
        404: { description: 'Not found', content: { [json]: { schema: err } } },
      },
    },
    put: {
      tags: ['Customers'],
      summary: 'Update customer',
      security: bearer,
      parameters: [parameters.id],
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/CustomerInput' } } },
      },
      responses: {
        200: ok({ $ref: '#/components/schemas/Customer' }),
        404: { description: 'Not found', content: { [json]: { schema: err } } },
      },
    },
    delete: {
      tags: ['Customers'],
      summary: 'Soft-delete customer',
      security: bearer,
      parameters: [parameters.id],
      responses: {
        204: { description: 'Deleted' },
        409: { description: 'Has invoices or work orders', content: { [json]: { schema: err } } },
      },
    },
  },

  '/api/v1/products': {
    get: {
      tags: ['Products'],
      summary: 'List products (paginated)',
      security: bearer,
      parameters: [
        parameters.page,
        parameters.size,
        { name: 'q', in: 'query', schema: { type: 'string' } },
        { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
      ],
      responses: { 200: pageOf('#/components/schemas/Product') },
    },
    post: {
      tags: ['Products'],
      summary: 'Create product',
      security: bearer,
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/ProductInput' } } },
      },
      responses: { 201: ok({ $ref: '#/components/schemas/Product' }) },
    },
  },
  '/api/v1/products/{id}': {
    get: {
      tags: ['Products'],
      summary: 'Get product',
      security: bearer,
      parameters: [parameters.id],
      responses: {
        200: ok({ $ref: '#/components/schemas/Product' }),
        404: { description: 'Not found', content: { [json]: { schema: err } } },
      },
    },
    put: {
      tags: ['Products'],
      summary: 'Update product',
      security: bearer,
      parameters: [parameters.id],
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/ProductInput' } } },
      },
      responses: { 200: ok({ $ref: '#/components/schemas/Product' }) },
    },
    delete: {
      tags: ['Products'],
      summary: 'Soft-delete product',
      security: bearer,
      parameters: [parameters.id],
      responses: { 204: { description: 'Deleted' } },
    },
  },

  '/api/v1/invoices': {
    get: {
      tags: ['Invoices'],
      summary: 'List invoices (paginated)',
      security: bearer,
      parameters: [
        parameters.page,
        parameters.size,
        {
          name: 'status',
          in: 'query',
          schema: { type: 'string', enum: ['DRAFT', 'ISSUED', 'CANCELLED'] },
        },
        { name: 'q', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: pageOf('#/components/schemas/InvoiceSummary') },
    },
    post: {
      tags: ['Invoices'],
      summary: 'Create draft invoice',
      security: bearer,
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/InvoiceInput' } } },
      },
      responses: { 201: ok({ $ref: '#/components/schemas/InvoiceDetail' }) },
    },
  },
  '/api/v1/invoices/{id}': {
    get: {
      tags: ['Invoices'],
      summary: 'Get invoice detail',
      security: bearer,
      parameters: [parameters.id],
      responses: {
        200: ok({ $ref: '#/components/schemas/InvoiceDetail' }),
        404: { description: 'Not found', content: { [json]: { schema: err } } },
      },
    },
    put: {
      tags: ['Invoices'],
      summary: 'Update draft invoice',
      security: bearer,
      parameters: [parameters.id],
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/InvoiceInput' } } },
      },
      responses: { 200: ok({ $ref: '#/components/schemas/InvoiceDetail' }) },
    },
    delete: {
      tags: ['Invoices'],
      summary: 'Delete draft invoice',
      security: bearer,
      parameters: [parameters.id],
      responses: { 204: { description: 'Deleted' } },
    },
  },
  '/api/v1/invoices/{id}/pdf': {
    get: {
      tags: ['Invoices'],
      summary: 'Download invoice PDF',
      security: bearer,
      parameters: [parameters.id],
      responses: {
        200: {
          description: 'PDF file',
          content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
        },
        404: { description: 'Not found', content: { [json]: { schema: err } } },
      },
    },
  },
  '/api/v1/invoices/{id}/status': {
    patch: {
      tags: ['Invoices'],
      summary: 'Change invoice status',
      description: 'Allowed: DRAFT → ISSUED → CANCELLED',
      security: bearer,
      parameters: [parameters.id],
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/StatusPatch' } } },
      },
      responses: { 200: ok({ $ref: '#/components/schemas/InvoiceDetail' }) },
    },
  },

  '/api/v1/work-orders': {
    get: {
      tags: ['Work Orders'],
      summary: 'List work orders (paginated)',
      security: bearer,
      parameters: [
        parameters.page,
        parameters.size,
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'CANCELLED'],
          },
        },
        { name: 'q', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: pageOf('#/components/schemas/WorkOrderSummary') },
    },
    post: {
      tags: ['Work Orders'],
      summary: 'Create work order',
      security: bearer,
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/WorkOrderInput' } } },
      },
      responses: { 201: ok({ $ref: '#/components/schemas/WorkOrderDetail' }) },
    },
  },
  '/api/v1/work-orders/{id}': {
    get: {
      tags: ['Work Orders'],
      summary: 'Get work order',
      security: bearer,
      parameters: [parameters.id],
      responses: { 200: ok({ $ref: '#/components/schemas/WorkOrderDetail' }) },
    },
    put: {
      tags: ['Work Orders'],
      summary: 'Update work order',
      security: bearer,
      parameters: [parameters.id],
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/WorkOrderInput' } } },
      },
      responses: { 200: ok({ $ref: '#/components/schemas/WorkOrderDetail' }) },
    },
    delete: {
      tags: ['Work Orders'],
      summary: 'Delete work order',
      security: bearer,
      parameters: [parameters.id],
      responses: { 204: { description: 'Deleted' } },
    },
  },
  '/api/v1/work-orders/{id}/status': {
    patch: {
      tags: ['Work Orders'],
      summary: 'Change work order status',
      security: bearer,
      parameters: [parameters.id],
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/StatusPatch' } } },
      },
      responses: { 200: ok({ $ref: '#/components/schemas/WorkOrderDetail' }) },
    },
  },

  '/api/v1/reports/dashboard': {
    get: {
      tags: ['Reports'],
      summary: 'Dashboard statistics',
      security: bearer,
      parameters: [
        { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: { 200: ok({ $ref: '#/components/schemas/DashboardStats' }) },
    },
  },
  '/api/v1/reports/yearly-trend': {
    get: {
      tags: ['Reports'],
      summary: 'Multi-year invoice trend',
      security: bearer,
      parameters: [
        {
          name: 'years',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
        },
      ],
      responses: {
        200: ok({ type: 'array', items: { $ref: '#/components/schemas/YearlyTrendPoint' } }),
      },
    },
  },

  '/api/v1/settings': {
    get: {
      tags: ['Settings'],
      summary: 'Get organization settings',
      security: bearer,
      responses: { 200: ok({ $ref: '#/components/schemas/OrganizationSettings' }) },
    },
    put: {
      tags: ['Settings'],
      summary: 'Update organization settings',
      security: bearer,
      requestBody: {
        required: true,
        content: { [json]: { schema: { $ref: '#/components/schemas/OrganizationSettings' } } },
      },
      responses: { 200: ok({ $ref: '#/components/schemas/OrganizationSettings' }) },
    },
  },
};
