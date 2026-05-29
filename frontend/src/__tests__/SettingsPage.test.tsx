import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test/utils';
import { SettingsPage } from '@features/settings/pages/SettingsPage';

describe('SettingsPage', () => {
  it('renders all 4 tabs', () => {
    render(<SettingsPage />);
    const buttons = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    expect(buttons.some((t) => /Company/.test(t))).toBe(true);
    expect(buttons.some((t) => /Invoice/.test(t))).toBe(true);
    expect(buttons.some((t) => /Tax/.test(t))).toBe(true);
    expect(buttons.some((t) => /Profile/.test(t))).toBe(true);
  });

  it('Company tab shows name input', () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
  });

  it('switches to Invoice tab', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /^Invoice$/i }));
    expect(screen.getByLabelText(/Invoice Prefix/i)).toBeInTheDocument();
  });

  it('switches to Tax tab and shows GST rates', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /^Tax$/i }));
    expect(screen.getByText('Default GST Rate')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '18%' })).toBeInTheDocument();
  });

  it('Profile tab shows security section', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /^Profile$/i }));
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('shows brand text in profile tab', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /^Profile$/i }));
    expect(screen.getByText(/Siddhant Logistics Billing Suite/i)).toBeInTheDocument();
  });
});
