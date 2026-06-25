import { registerSW } from 'virtual:pwa-register';

type RefreshHandler = () => void;

let notifyNeedRefresh: RefreshHandler | null = null;

export function onPwaNeedRefresh(handler: RefreshHandler | null) {
  notifyNeedRefresh = handler;
}

let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | null = null;

export async function applyPwaUpdate() {
  if (applyUpdate) await applyUpdate(true);
}

export function registerPwa() {
  if (import.meta.env.DEV) return;

  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      notifyNeedRefresh?.();
    },
  });
}
