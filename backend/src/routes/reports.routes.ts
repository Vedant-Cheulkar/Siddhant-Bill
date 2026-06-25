import { Router } from 'express';
import { ok } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { YEARLY_STATS } from '../seed/seedData.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const fromDate = String(req.query.fromDate ?? '');
    const year = fromDate ? fromDate.slice(0, 4) : String(new Date().getFullYear());
    const stats = YEARLY_STATS[year] ?? { issued: 0, draft: 0, cancelled: 0, total: 0 };

    res.json(
      ok({
        fromDate: fromDate || `${year}-01-01`,
        toDate: String(req.query.toDate ?? `${year}-12-31`),
        issuedInvoiceCount: stats.issued,
        draftInvoiceCount: stats.draft,
        cancelledInvoiceCount: stats.cancelled,
        grandTotal: stats.total,
      }),
    );
  }),
);

router.get('/yearly-trend', (_req, res) => {
  res.json(ok([]));
});

export default router;
