import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import { Badge, InvoiceStatusBadge } from '@shared/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders active variant', () => {
    render(<Badge variant="active">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders inactive variant', () => {
    render(<Badge variant="inactive">Inactive</Badge>);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});

describe('InvoiceStatusBadge', () => {
  it('renders DRAFT status', () => {
    render(<InvoiceStatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders ISSUED status', () => {
    render(<InvoiceStatusBadge status="ISSUED" />);
    expect(screen.getByText('Issued')).toBeInTheDocument();
  });

  it('renders CANCELLED status', () => {
    render(<InvoiceStatusBadge status="CANCELLED" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});
