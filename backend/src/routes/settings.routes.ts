import { Router } from 'express';
import {
  OrganizationSettings,
  toSettingsResponse,
  type OrganizationSettingsDoc,
} from '../models/OrganizationSettings.js';
import { ok } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import {
  sanitizeIndianCustomerFields,
  validateGstin,
  validateGstinPanConsistency,
  validateGstinStateConsistency,
  validateIndianPhone,
  validateIndianStateCode,
  validatePan,
} from '../utils/india.js';

const router = Router();
router.use(requireAuth, requirePermission('INVOICE_READ'));

function validateCompanyFields(company: Record<string, unknown>): string | null {
  const fields = sanitizeIndianCustomerFields({
    gstin: company.gstin as string | undefined,
    pan: company.pan as string | undefined,
    phone: company.phone as string | undefined,
    billingStateCode: (company.stateCode as string) ?? '27',
  });

  if (fields.billingStateCode) {
    const err = validateIndianStateCode(fields.billingStateCode);
    if (err) return err;
  }
  if (fields.pan) {
    const err = validatePan(fields.pan);
    if (err) return err;
  }
  if (fields.gstin) {
    const err = validateGstin(fields.gstin);
    if (err) return err;
  }
  if (fields.phone) {
    const err = validateIndianPhone(fields.phone);
    if (err) return err;
  }
  if (fields.gstin && fields.pan) {
    const err = validateGstinPanConsistency(fields.gstin, fields.pan);
    if (err) return err;
  }
  if (fields.gstin && fields.billingStateCode) {
    const err = validateGstinStateConsistency(fields.gstin, fields.billingStateCode);
    if (err) return err;
  }

  return null;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const doc = await OrganizationSettings.findById(orgId).lean();
    res.json(ok(toSettingsResponse(doc as OrganizationSettingsDoc | null)));
  }),
);

router.put(
  '/',
  requirePermission('INVOICE_WRITE'),
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const body = req.body as {
      company?: Record<string, unknown>;
      invoice?: Record<string, unknown>;
      tax?: Record<string, unknown>;
    };

    if (body.company) {
      const companyError = validateCompanyFields(body.company);
      if (companyError) return res.status(400).json({ message: companyError });
    }

    if (body.invoice?.prefix !== undefined) {
      const prefix = String(body.invoice.prefix).trim();
      if (!prefix || prefix.length > 10) {
        return res.status(400).json({ message: 'Invoice prefix must be 1–10 characters' });
      }
    }

    if (body.tax?.defaultRate !== undefined) {
      const rate = Number(body.tax.defaultRate);
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({ message: 'Default tax rate must be between 0 and 100' });
      }
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.company) {
      const fields = sanitizeIndianCustomerFields({
        gstin: body.company.gstin as string | undefined,
        pan: body.company.pan as string | undefined,
        phone: body.company.phone as string | undefined,
        billingStateCode: body.company.stateCode as string | undefined,
      });
      update.company = {
        ...body.company,
        gstin: fields.gstin ?? body.company.gstin,
        pan: fields.pan ?? body.company.pan,
        phone: fields.phone ?? body.company.phone,
        stateCode: fields.billingStateCode ?? body.company.stateCode,
      };
    }
    if (body.invoice) update.invoice = body.invoice;
    if (body.tax) update.tax = body.tax;

    const doc = await OrganizationSettings.findByIdAndUpdate(
      orgId,
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.json(ok(toSettingsResponse(doc)));
  }),
);

export default router;
