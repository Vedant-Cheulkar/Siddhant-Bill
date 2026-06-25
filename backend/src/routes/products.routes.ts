import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Product, toProductResponse } from '../models/Product.js';
import { ok } from '../utils/apiResponse.js';
import { paginate, parsePageQuery } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const { page, size } = parsePageQuery(req.query as Record<string, unknown>);
    const q = String(req.query.q ?? '').toLowerCase();
    const isActive = req.query.isActive as string | undefined;

    const filter: Record<string, unknown> = { organizationId: orgId, deletedAt: null };
    if (isActive === 'true') filter.active = true;
    if (isActive === 'false') filter.active = false;

    let docs = await Product.find(filter).sort({ name: 1 }).lean();
    if (q) {
      docs = docs.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    res.json(ok(paginate(docs.map((d) => toProductResponse(d as never)), page, size)));
  }),
);

router.get(
  '/:id',
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
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
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
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
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
