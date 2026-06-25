import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@infra/http/queryClient';
import { AppLayout } from '@shared/components/layout/AppLayout';
import { ProtectedRoute } from '@shared/components/layout/ProtectedRoute';
import { useAuthStore } from '@features/auth/store/authStore';

if (import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
  if (!localStorage.getItem('access_token')) {
    localStorage.setItem('access_token', 'dev-bypass-token');
    localStorage.setItem('refresh_token', 'dev-bypass-refresh');
    const store = useAuthStore.getState();
    store.setUser({
      id: 'dev-user',
      email: 'dev@siddhant.local',
      fullName: 'Dev User',
      tenantId: 'dev-tenant',
      organizationId: 'dev-org',
      roles: ['ADMIN'],
      permissions: [],
    });
  }
}
import { LoginPage } from '@features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@features/auth/pages/ResetPasswordPage';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';
import { InvoiceListPage } from '@features/invoices/pages/InvoiceListPage';
import { InvoiceDetailPage } from '@features/invoices/pages/InvoiceDetailPage';
import { CustomerListPage } from '@features/customers/pages/CustomerListPage';
import { CustomerFormPage } from '@features/customers/pages/CustomerFormPage';
import { ReportPage } from '@features/reports/pages/ReportPage';
import { ItemGroupsPage } from '@features/item-groups/pages/ItemGroupsPage';
import { ProductFormPage } from '@features/item-groups/pages/ProductFormPage';
import { WorkOrdersPage } from '@features/work-orders/pages/WorkOrdersPage';
import { WorkOrderFormPage } from '@features/work-orders/pages/WorkOrderFormPage';
import { NotFoundPage } from './features/placeholders/NotFoundPage';
import { SettingsPage } from '@features/settings/pages/SettingsPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/"                        element={<DashboardPage />} />
              <Route path="/invoices"                element={<InvoiceListPage />} />
              <Route path="/invoices/new"            element={<InvoiceDetailPage />} />
              <Route path="/invoices/:id"            element={<InvoiceDetailPage />} />
              <Route path="/customers"               element={<CustomerListPage />} />
              <Route path="/customers/new"           element={<CustomerFormPage />} />
              <Route path="/customers/:id/edit"      element={<CustomerFormPage />} />
              <Route path="/reports"                 element={<ReportPage />} />
              <Route path="/item-groups"             element={<ItemGroupsPage />} />
              <Route path="/item-groups/new"         element={<ProductFormPage />} />
              <Route path="/item-groups/:id/edit"    element={<ProductFormPage />} />
              <Route path="/work-orders"             element={<WorkOrdersPage />} />
              <Route path="/work-orders/new"         element={<WorkOrderFormPage />} />
              <Route path="/work-orders/:id"         element={<WorkOrderFormPage />} />
              <Route path="/settings"                element={<SettingsPage />} />
              <Route path="*"                        element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
