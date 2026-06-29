import { Search, X } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: SearchInputProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 w-full bg-bg border border-border rounded-lg px-3 py-1.5 transition-all',
        'focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-surface',
        className
      )}
    >
      <Search size={12} className="text-muted shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="outline-none text-xs flex-1 bg-transparent placeholder:text-muted text-fg min-w-0"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-muted hover:text-fg transition-colors shrink-0"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
