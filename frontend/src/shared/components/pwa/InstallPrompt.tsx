import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { AppLogo } from '@shared/components/brand/AppLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'siddhant-pwa-install-dismissed';

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true',
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferred || dismissed) return null;

  const handleInstall = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setDeferred(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
    setDeferred(null);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border bg-accent-bg px-4 py-2.5 safe-top">
      <div className="flex min-w-0 items-center gap-2 text-sm text-accent-text">
        <AppLogo variant="mark" className="h-6 w-6 shrink-0" />
        <span className="font-medium truncate">Install Siddhant Bill for quick access</span>
      </div>
      <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
        <Button type="button" size="sm" variant="outline" onClick={handleInstall}>
          Install
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-fg"
          aria-label="Dismiss install prompt"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
