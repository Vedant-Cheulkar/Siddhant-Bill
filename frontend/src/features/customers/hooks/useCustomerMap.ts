import { useCustomers } from './useCustomers';

/** Returns a Map<customerId, customerName> for quick lookup in list views */
export function useCustomerMap() {
  const { data } = useCustomers({ size: 200 });
  const map = new Map<string, string>();
  (data?.content ?? []).forEach((c) => map.set(c.id, c.name));
  return map;
}
