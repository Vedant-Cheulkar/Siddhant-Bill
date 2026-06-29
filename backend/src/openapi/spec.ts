import { schemas } from './schemas.js';
import { paths } from './paths.js';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Siddhant Logistics Billing API',
    version: '1.0.0',
    description:
      'REST API for Siddhant Bill — customers, products, invoices, work orders, reports, and settings. ' +
      'All successful JSON responses use `{ data, message?, timestamp }`. Authenticated routes require `Authorization: Bearer <accessToken>`.',
    contact: {
      name: 'Siddhant Logistics',
    },
  },
  servers: [
    { url: 'http://localhost:8080', description: 'Local development' },
    { url: 'https://siddhant-bill.onrender.com', description: 'Production' },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Customers' },
    { name: 'Products' },
    { name: 'Invoices' },
    { name: 'Work Orders' },
    { name: 'Reports' },
    { name: 'Settings' },
  ],
  paths,
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from POST /api/v1/auth/login',
      },
    },
    schemas,
  },
};
