import { Router } from 'express';
import { ok } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { getDashboardStats, getYearlyTrend } from '../utils/reports.js';

const router = Router();
router.use(requireAuth, requirePermission('REPORT_READ'));

function resolveDateRange(query: Record<string, unknown>) {
  const fromDate = String(query.fromDate ?? '');
  const toDate = String(query.toDate ?? '');
  const year = fromDate ? fromDate.slice(0, 4) : String(new Date().getFullYear());
  return {
    fromDate: fromDate || `${year}-01-01`,
    toDate: toDate || `${year}-12-31`,
  };
}

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const { fromDate, toDate } = resolveDateRange(req.query as Record<string, unknown>);
    const stats = await getDashboardStats(req.user!.organizationId, fromDate, toDate);
    res.json(ok(stats));
  }),
);

router.get(
  '/yearly-trend',
  asyncHandler(async (req, res) => {
    const currentYear = new Date().getFullYear();
    const span = Math.min(Math.max(Number(req.query.years ?? 5), 1), 10);
    const years = Array.from({ length: span }, (_, i) => currentYear - span + 1 + i);
    const trend = await getYearlyTrend(req.user!.organizationId, years);
    res.json(ok(trend));
  }),
);

export default router;
