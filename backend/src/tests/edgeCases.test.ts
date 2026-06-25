import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertInvoiceDeletable,
  assertInvoiceEditable,
  assertInvoiceTransition,
  assertWorkOrderTransition,
} from '../utils/statusGuards.js';
import { validateLineItems } from '../utils/lineItems.js';
import { validateEmail } from '../utils/email.js';

describe('statusGuards', () => {
  it('allows DRAFT to ISSUED', () => {
    assert.doesNotThrow(() => assertInvoiceTransition('DRAFT', 'ISSUED'));
  });

  it('blocks ISSUED to DRAFT', () => {
    assert.throws(() => assertInvoiceTransition('ISSUED', 'DRAFT'));
  });

  it('blocks editing issued invoices', () => {
    assert.throws(() => assertInvoiceEditable('ISSUED'));
  });

  it('blocks deleting issued invoices', () => {
    assert.throws(() => assertInvoiceDeletable('ISSUED'));
  });

  it('allows COMPLETED to INVOICED', () => {
    assert.doesNotThrow(() => assertWorkOrderTransition('COMPLETED', 'INVOICED'));
  });
});

describe('validateLineItems', () => {
  it('requires at least one item', () => {
    assert.equal(validateLineItems([]), 'At least one line item is required');
  });

  it('rejects non-positive quantity', () => {
    assert.match(
      validateLineItems([{ description: 'Test', quantity: 0, unitPrice: 10, taxPercent: 18 }]) ?? '',
      /quantity/,
    );
  });
});

describe('validateEmail', () => {
  it('accepts valid email', () => {
    assert.equal(validateEmail('user@example.com'), null);
  });

  it('rejects invalid email', () => {
    assert.ok(validateEmail('not-an-email'));
  });
});
