import PDFDocument from 'pdfkit';
import type { InvoiceDoc } from '../models/Invoice.js';
import type { OrganizationSettingsDoc } from '../models/OrganizationSettings.js';
import { DEFAULT_SETTINGS } from '../models/OrganizationSettings.js';

interface PdfInvoiceInput {
  invoice: InvoiceDoc;
  customerName?: string;
  customerGstin?: string;
  settings?: OrganizationSettingsDoc | null;
}

export function buildInvoicePdf(input: PdfInvoiceInput): Promise<Buffer> {
  const { invoice, customerName, customerGstin, settings } = input;
  const company = { ...DEFAULT_SETTINGS.company, ...settings?.company };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(company.name || 'Invoice', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('#444');
    if (company.address) doc.text(company.address);
    if (company.city || company.stateCode) {
      doc.text([company.city, company.stateCode ? `State: ${company.stateCode}` : ''].filter(Boolean).join(', '));
    }
    if (company.gstin) doc.text(`GSTIN: ${company.gstin}`);
    if (company.phone) doc.text(`Phone: ${company.phone}`);
    if (company.email) doc.text(`Email: ${company.email}`);

    const DOC_TYPE_LABELS: Record<string, string> = {
      TAX_INVOICE: 'TAX INVOICE',
      BILL_OF_SUPPLY: 'BILL OF SUPPLY',
      CREDIT_NOTE: 'CREDIT NOTE',
      DEBIT_NOTE: 'DEBIT NOTE',
    };
    const docTypeLabel = DOC_TYPE_LABELS[invoice.documentType ?? 'TAX_INVOICE'] ?? 'TAX INVOICE';

    doc.moveDown(1);
    doc.fillColor('#000').fontSize(14).text(docTypeLabel, { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${invoice.displayNumber}`, { align: 'right' });
    doc.text(`Date: ${invoice.invoiceDate}`, { align: 'right' });
    if (invoice.dueDate) doc.text(`Due: ${invoice.dueDate}`, { align: 'right' });
    doc.text(`Status: ${invoice.status}`, { align: 'right' });
    if (invoice.reverseCharge) doc.fillColor('#c00').text('Reverse Charge: Yes', { align: 'right' }).fillColor('#000');

    doc.moveDown(1);
    doc.fontSize(11).text('Bill To', { underline: true });
    doc.fontSize(10).text(customerName ?? 'Customer');
    if (customerGstin) doc.text(`GSTIN: ${customerGstin}`);

    doc.moveDown(1);
    const tableTop = doc.y;
    const colX = [50, 280, 330, 390, 450, 510];

    doc.fontSize(9).fillColor('#333');
    doc.text('Description', colX[0], tableTop, { width: 220 });
    doc.text('Qty', colX[1], tableTop);
    doc.text('Rate', colX[2], tableTop);
    doc.text('Tax%', colX[3], tableTop);
    doc.text('Total', colX[4], tableTop, { align: 'right', width: 90 });

    doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).stroke('#ccc');

    let y = tableTop + 22;
    const lineItems = Array.from(invoice.items ?? []);
    for (const item of lineItems) {
      const rowHeight = item.hsnSac ? 28 : 18;
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      doc.fillColor('#000').fontSize(9);
      doc.text(item.description, colX[0], y, { width: 220 });
      if (item.hsnSac) {
        doc.fontSize(7).fillColor('#777').text(`HSN/SAC: ${item.hsnSac}`, colX[0], y + 12, { width: 220 });
        doc.fontSize(9).fillColor('#000');
      }
      doc.text(String(item.quantity), colX[1], y);
      doc.text(item.unitPrice.toFixed(2), colX[2], y);
      doc.text(`${item.taxPercent}%`, colX[3], y);
      doc.text(item.lineTotal.toFixed(2), colX[4], y, { align: 'right', width: 90 });
      y += rowHeight;
    }

    doc.moveDown(2);

    const hasTaxBreakdown = invoice.taxableAmount != null && (invoice.cgstAmount != null || invoice.igstAmount != null);
    if (hasTaxBreakdown) {
      const isIntra = invoice.taxType === 'INTRA';
      doc.fontSize(9).fillColor('#444');
      doc.text(`Taxable Amount: ${invoice.taxableAmount!.toFixed(2)}`, { align: 'right' });
      if (isIntra) {
        doc.text(`CGST: ${invoice.cgstAmount!.toFixed(2)}`, { align: 'right' });
        doc.text(`SGST: ${invoice.sgstAmount!.toFixed(2)}`, { align: 'right' });
      } else {
        doc.text(`IGST: ${invoice.igstAmount!.toFixed(2)}`, { align: 'right' });
      }
      if (invoice.placeOfSupply) {
        doc.text(`Place of Supply: ${invoice.placeOfSupply}`, { align: 'right' });
      }
      doc.moveDown(0.5);
    }

    doc.fontSize(11).fillColor('#000').text(`Grand Total (${invoice.currency ?? 'INR'}): ${invoice.grandTotal.toFixed(2)}`, {
      align: 'right',
    });

    if (invoice.notes) {
      doc.moveDown(1.5);
      doc.fontSize(9).fillColor('#444').text(`Notes: ${invoice.notes}`);
    }

    const terms = settings?.invoice?.terms ?? DEFAULT_SETTINGS.invoice.terms;
    if (terms) {
      doc.moveDown(1);
      doc.fontSize(8).fillColor('#666').text(terms, { width: 500 });
    }

    doc.end();
  });
}
