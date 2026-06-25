import { useQuery } from '@tanstack/react-query';
import { listCustomerLookup } from '../api/customers.api';
import { CUSTOMER_KEYS } from '../queryKeys';

/** Returns a Map<customerId, customerName> for quick lookup in list views */
export function useCustomerMap() {
  const { data } = useQuery({
    queryKey: [...CUSTOMER_KEYS.all, 'lookup'],
    queryFn: listCustomerLookup,
    staleTime: 1000 * 60 * 5,
  });

  const map = new Map<string, string>();
  (data ?? []).forEach((c) => map.set(c.id, c.name));
  return map;
}
