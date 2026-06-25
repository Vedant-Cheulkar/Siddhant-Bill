import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings, type OrganizationSettings } from '../api/settings.api';
import { useSettingsStore } from '../store/useSettingsStore';

export const SETTINGS_KEYS = {
  all: ['settings'] as const,
};

export function useOrgSettings() {
  const hydrate = useSettingsStore((s) => s.hydrate);

  return useQuery({
    queryKey: SETTINGS_KEYS.all,
    queryFn: async () => {
      const data = await getSettings();
      hydrate(data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  const hydrate = useSettingsStore((s) => s.hydrate);

  return useMutation({
    mutationFn: (data: Partial<OrganizationSettings>) => updateSettings(data),
    onSuccess: (data) => {
      hydrate(data);
      queryClient.setQueryData(SETTINGS_KEYS.all, data);
    },
  });
}
