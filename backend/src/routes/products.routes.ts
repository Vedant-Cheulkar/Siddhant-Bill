import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Product, toProductResponse } from '../models/Product.js';
import { ok } from '../utils/apiResponse.js';
import { parsePageQuery } from '../utils/pagination.js';
import { buildPageResult, escapeRegex } from '../utils/mongoPaginate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validateHsnSac } from '../utils/india.js';

const router = Router();
router.use(requireAuth);

const canRead = requirePermission('PRODUCT_READ');
const canWrite = requirePermission('PRODUCT_WRITE');

router.get(
  '/',
  canRead,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const { page, size } = parsePageQuery(req.query as Record<string, unknown>);
    const q = String(req.query.q ?? '').trim();
    const isActive = req.query.isActive as string | undefined;

    const filter: Record<string, unknown> = { organizationId: orgId, deletedAt: null };
    if (isActive === 'true') filter.active = true;
    if (isActive === 'false') filter.active = false;
    if (q) {
      const pattern = escapeRegex(q);
      filter.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { sku: { $regex: pattern, $options: 'i' } },
      ];
    }

    const safeSize = Math.min(Math.max(size, 1), 100);
    const safePage = Math.max(page, 0);

    const [docs, total] = await Promise.all([
      Product.find(filter)
        .sort({ name: 1 })
        .skip(safePage * safeSize)
        .limit(safeSize)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json(
      ok(
        buildPageResult(
          docs.map((d) => toProductResponse(d as never)),
          safePage,
          safeSize,
          total,
        ),
      ),
    );
  }),
);

router.get(
  '/:id',
  canRead,
  asyncHandler(async (req, res) => {
    const doc = await Product.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      deletedAt: null,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toProductResponse(doc)));
  }),
);

router.post(
  '/',
  canWrite,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    if (body.hsnSac) {
      const hsnError = validateHsnSac(String(body.hsnSac));
      if (hsnError) return res.status(400).json({ message: hsnError });
    }
    const doc = await Product.create({
      _id: randomUUID(),
      organizationId: req.user!.organizationId,
      sku: body.sku,
      name: body.name,
      description: body.description,
      hsnSac: body.hsnSac,
      unitId: body.unitId,
      salePrice: body.salePrice ?? 0,
      taxGroupId: body.taxGroupId,
      active: body.active ?? true,
    });
    res.status(201).json(ok(toProductResponse(doc)));
  }),
);

router.put(
  '/:id',
  canWrite,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    if (body.hsnSac) {
      const hsnError = validateHsnSac(String(body.hsnSac));
      if (hsnError) return res.status(400).json({ message: hsnError });
    }
    const doc = await Product.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      {
        sku: body.sku,
        name: body.name,
        description: body.description,
        hsnSac: body.hsnSac,
        unitId: body.unitId,
        salePrice: body.salePrice,
        taxGroupId: body.taxGroupId,
        active: body.active,
        updatedAt: new Date(),
      },
      { new: true },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toProductResponse(doc)));
  }),
);

router.delete(
  '/:id',
  canWrite,
  asyncHandler(async (req, res) => {
    const doc = await Product.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      { deletedAt: new Date(), updatedAt: new Date() },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  }),
);

export default router;
