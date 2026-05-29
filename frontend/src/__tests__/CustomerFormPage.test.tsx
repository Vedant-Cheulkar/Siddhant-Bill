import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/utils';
import { CustomerFormPage } from '@features/customers/pages/CustomerFormPage';

describe('CustomerFormPage', () => {
  it('renders new customer form with tabs', () => {
    render(<CustomerFormPage />);
    expect(screen.getByText('New Customer')).toBeInTheDocument();
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('shows basic info fields by default', () => {
    render(<CustomerFormPage />);
    expect(screen.getByLabelText(/customer code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<CustomerFormPage />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      // Zod v4 uses "Too small" messages for min-length violations
      const errorMessages = document.querySelectorAll('[role="alert"]');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('switches to billing tab', () => {
    render(<CustomerFormPage />);
    fireEvent.click(screen.getByText('Billing'));
    expect(screen.getByLabelText(/billing state code/i)).toBeInTheDocument();
  });

  it('switches to other tab and shows notes', () => {
    render(<CustomerFormPage />);
    fireEvent.click(screen.getByText('Other'));
    expect(screen.getByPlaceholderText(/optional notes/i)).toBeInTheDocument();
  });

  it('cancel button is present', () => {
    render(<CustomerFormPage />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
