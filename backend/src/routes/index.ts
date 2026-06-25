import { Router } from 'express';
import authRoutes from './auth.routes.js';
import customerRoutes from './customers.routes.js';
import productRoutes from './products.routes.js';
import invoiceRoutes from './invoices.routes.js';
import workOrderRoutes from './workOrders.routes.js';
import reportRoutes from './reports.routes.js';
import userRoutes from './users.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);

export default router;
