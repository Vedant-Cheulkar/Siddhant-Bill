import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { applyPwaUpdate, onPwaNeedRefresh } from '../../../pwa/registerPwa';
import { Button } from '@shared/components/ui/Button';

export function PwaUpdatePrompt() {
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    onPwaNeedRefresh(() => setVisible(true));
    return () => onPwaNeedRefresh(null);
  }, []);

  if (!visible) return null;

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await applyPwaUpdate();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg safe-bottom lg:left-auto lg:right-6"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-fg">Update available</p>
        <p className="text-xs text-muted">A new version of Siddhant Bill is ready.</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setVisible(false)}
          disabled={updating}
        >
          Later
        </Button>
        <Button type="button" size="sm" onClick={handleUpdate} disabled={updating}>
          <RefreshCw size={13} className={updating ? 'animate-spin' : ''} />
          Reload
        </Button>
      </div>
    </div>
  );
}
