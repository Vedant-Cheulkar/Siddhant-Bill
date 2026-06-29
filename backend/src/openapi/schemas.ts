export const schemas = {
  ErrorMessage: {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
    required: ['message'],
  },
  ApiEnvelope: {
    type: 'object',
    properties: {
      data: {},
      message: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
    },
    required: ['data', 'timestamp'],
  },
  PageResult: {
    type: 'object',
    properties: {
      content: { type: 'array', items: {} },
      page: { type: 'integer', minimum: 0 },
      size: { type: 'integer', minimum: 1, maximum: 100 },
      totalElements: { type: 'integer', minimum: 0 },
      totalPages: { type: 'integer', minimum: 0 },
      last: { type: 'boolean' },
    },
    required: ['content', 'page', 'size', 'totalElements', 'totalPages', 'last'],
  },
  LoginRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
    required: ['email', 'password'],
  },
  TokenResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      expiresIn: { type: 'integer', description: 'Access token TTL in seconds' },
    },
    required: ['accessToken', 'refreshToken', 'expiresIn'],
  },
  AuthProfile: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      fullName: { type: 'string' },
      tenantId: { type: 'string' },
      organizationId: { type: 'string' },
      roles: { type: 'array', items: { type: 'string', enum: ['ADMIN', 'ACCOUNTANT'] } },
      permissions: { type: 'array', items: { type: 'string' } },
    },
  },
  RefreshRequest: {
    type: 'object',
    properties: { refreshToken: { type: 'string' } },
    required: ['refreshToken'],
  },
  ChangePasswordRequest: {
    type: 'object',
    properties: {
      currentPassword: { type: 'string' },
      newPassword: { type: 'string', minLength: 8 },
    },
    required: ['currentPassword', 'newPassword'],
  },
  ForgotPasswordRequest: {
    type: 'object',
    properties: { email: { type: 'string', format: 'email' } },
    required: ['email'],
  },
  ResetPasswordRequest: {
    type: 'object',
    properties: {
      token: { type: 'string', format: 'uuid' },
      newPassword: { type: 'string', minLength: 8 },
    },
    required: ['token', 'newPassword'],
  },
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      fullName: { type: 'string' },
      role: { type: 'string', enum: ['ADMIN', 'ACCOUNTANT'] },
      active: { type: 'boolean' },
      organizationId: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateUserRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      fullName: { type: 'string' },
      password: { type: 'string', minLength: 8 },
      role: { type: 'string', enum: ['ADMIN', 'ACCOUNTANT'], default: 'ACCOUNTANT' },
    },
    required: ['email', 'fullName', 'password'],
  },
  UpdateUserRequest: {
    type: 'object',
    properties: {
      fullName: { type: 'string' },
      role: { type: 'string', enum: ['ADMIN', 'ACCOUNTANT'] },
      active: { type: 'boolean' },
      password: { type: 'string', minLength: 8 },
    },
  },
  Customer: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string' },
      name: { type: 'string' },
      gstin: { type: 'string' },
      pan: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      billingStateCode: { type: 'string', example: '27' },
      creditDays: { type: 'integer' },
      active: { type: 'boolean' },
      notes: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CustomerInput: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      name: { type: 'string' },
      gstin: { type: 'string' },
      pan: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      billingStateCode: { type: 'string' },
      creditDays: { type: 'integer', default: 30 },
      active: { type: 'boolean', default: true },
      notes: { type: 'string' },
    },
    required: ['code', 'name'],
  },
  CustomerLookup: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
    },
  },
  Product: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      sku: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      hsnSac: { type: 'string' },
      unitId: { type: 'string' },
      salePrice: { type: 'number' },
      taxGroupId: { type: 'string' },
      active: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  ProductInput: {
    type: 'object',
    properties: {
      sku: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      hsnSac: { type: 'string' },
      unitId: { type: 'string' },
      salePrice: { type: 'number', default: 0 },
      taxGroupId: { type: 'string' },
      active: { type: 'boolean', default: true },
    },
    required: ['sku', 'name'],
  },
  LineItemInput: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      productId: { type: 'string', format: 'uuid' },
      hsnSac: { type: 'string' },
      description: { type: 'string' },
      quantity: { type: 'number', minimum: 0.01 },
      unitPrice: { type: 'number', minimum: 0 },
      taxPercent: { type: 'number', minimum: 0, maximum: 100 },
      discountPercent: { type: 'number', minimum: 0, maximum: 100, default: 0 },
    },
    required: ['description', 'quantity', 'unitPrice', 'taxPercent'],
  },
  InvoiceSummary: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      displayNumber: { type: 'string' },
      status: { type: 'string', enum: ['DRAFT', 'ISSUED', 'CANCELLED'] },
      customerId: { type: 'string', format: 'uuid' },
      invoiceDate: { type: 'string', format: 'date' },
      grandTotal: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  InvoiceDetail: {
    allOf: [
      { $ref: '#/components/schemas/InvoiceSummary' },
      {
        type: 'object',
        properties: {
          dueDate: { type: 'string', format: 'date' },
          currency: { type: 'string', example: 'INR' },
          documentType: {
            type: 'string',
            enum: ['TAX_INVOICE', 'BILL_OF_SUPPLY', 'CREDIT_NOTE', 'DEBIT_NOTE'],
          },
          reverseCharge: { type: 'boolean' },
          placeOfSupply: { type: 'string' },
          taxType: { type: 'string', enum: ['INTRA', 'INTER'] },
          taxableAmount: { type: 'number' },
          cgstAmount: { type: 'number' },
          sgstAmount: { type: 'number' },
          igstAmount: { type: 'number' },
          notes: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/LineItemInput' } },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    ],
  },
  InvoiceInput: {
    type: 'object',
    properties: {
      customerId: { type: 'string', format: 'uuid' },
      invoiceDate: { type: 'string', format: 'date' },
      dueDate: { type: 'string', format: 'date' },
      currency: { type: 'string', default: 'INR' },
      documentType: {
        type: 'string',
        enum: ['TAX_INVOICE', 'BILL_OF_SUPPLY', 'CREDIT_NOTE', 'DEBIT_NOTE'],
      },
      reverseCharge: { type: 'boolean' },
      notes: { type: 'string' },
      workOrderId: { type: 'string', format: 'uuid', description: 'POST only — marks work order INVOICED' },
      items: { type: 'array', items: { $ref: '#/components/schemas/LineItemInput' } },
    },
    required: ['customerId', 'items'],
  },
  StatusPatch: {
    type: 'object',
    properties: { status: { type: 'string' } },
    required: ['status'],
  },
  WorkOrderSummary: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      orderNumber: { type: 'string' },
      status: {
        type: 'string',
        enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'CANCELLED'],
      },
      customerId: { type: 'string', format: 'uuid' },
      vehicleRef: { type: 'string' },
      serviceDate: { type: 'string', format: 'date' },
      grandTotal: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  WorkOrderDetail: {
    allOf: [
      { $ref: '#/components/schemas/WorkOrderSummary' },
      {
        type: 'object',
        properties: {
          description: { type: 'string' },
          notes: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/LineItemInput' } },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    ],
  },
  WorkOrderInput: {
    type: 'object',
    properties: {
      customerId: { type: 'string', format: 'uuid' },
      vehicleRef: { type: 'string' },
      serviceDate: { type: 'string', format: 'date' },
      description: { type: 'string' },
      notes: { type: 'string' },
      items: { type: 'array', items: { $ref: '#/components/schemas/LineItemInput' } },
    },
    required: ['customerId', 'items'],
  },
  DashboardStats: {
    type: 'object',
    properties: {
      fromDate: { type: 'string', format: 'date' },
      toDate: { type: 'string', format: 'date' },
      issuedInvoiceCount: { type: 'integer' },
      draftInvoiceCount: { type: 'integer' },
      cancelledInvoiceCount: { type: 'integer' },
      grandTotal: { type: 'number' },
    },
  },
  YearlyTrendPoint: {
    type: 'object',
    properties: {
      year: { type: 'integer' },
      issued: { type: 'number' },
      draft: { type: 'number' },
      cancelled: { type: 'number' },
      total: { type: 'number' },
    },
  },
  OrganizationSettings: {
    type: 'object',
    properties: {
      company: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          gstin: { type: 'string' },
          pan: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          stateCode: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
        },
      },
      invoice: {
        type: 'object',
        properties: {
          prefix: { type: 'string' },
          startingNumber: { type: 'integer' },
          defaultDueDays: { type: 'integer' },
          terms: { type: 'string' },
        },
      },
      tax: {
        type: 'object',
        properties: {
          defaultRate: { type: 'number' },
        },
      },
    },
  },
  HealthResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['UP', 'DOWN'] },
      database: { type: 'string', enum: ['UP', 'DOWN'] },
    },
  },
} as const;

export const parameters = {
  page: {
    name: 'page',
    in: 'query',
    schema: { type: 'integer', minimum: 0, default: 0 },
    description: 'Zero-based page index',
  },
  size: {
    name: 'size',
    in: 'query',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    description: 'Page size (max 100)',
  },
  id: {
    name: 'id',
    in: 'path',
    required: true,
    schema: { type: 'string', format: 'uuid' },
  },
} as const;
