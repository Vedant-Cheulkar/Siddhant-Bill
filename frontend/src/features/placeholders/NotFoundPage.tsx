import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-5 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
        <FileQuestion size={28} className="text-muted" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-fg mb-2">Page not found</h1>
        <p className="text-sm text-muted max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );
}
