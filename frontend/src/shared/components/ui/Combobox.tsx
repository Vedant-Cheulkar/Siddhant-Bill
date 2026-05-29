import { useState, useRef, useEffect, useId } from 'react';
import { Search, ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export interface ComboboxOption {
  value: string;
  label: string;
  sub?: string;
}

interface ComboboxProps {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string, option?: ComboboxOption) => void;
  options: ComboboxOption[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  label,
  error,
  hint,
  placeholder = 'Search…',
  value,
  onChange,
  options,
  isLoading,
  onSearch,
  disabled,
  className,
}: ComboboxProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    setHighlighted(0);
  }, [options]);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    onSearch?.('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option: ComboboxOption) => {
    onChange(option.value, option);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen(); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (options[highlighted]) handleSelect(options[highlighted]);
        break;
      case 'Escape':
        setOpen(false);
        setQuery('');
        break;
    }
  };

  useEffect(() => {
    if (listRef.current && open) {
      const item = listRef.current.children[highlighted] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted, open]);

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-input border bg-surface text-sm text-left',
            'focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors',
            error ? 'border-red-400' : 'border-border',
            disabled && 'opacity-50 cursor-not-allowed',
            open && 'border-indigo-400 ring-2 ring-indigo-100'
          )}
        >
          <span className={selected ? 'text-fg' : 'text-muted'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={14}
            className={cn('text-muted shrink-0 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
            {/* Search input inside dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search size={13} className="text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
                onKeyDown={handleKeyDown}
                placeholder="Type to filter…"
                className="flex-1 text-sm bg-transparent outline-none text-fg placeholder:text-muted"
              />
              {isLoading && <Loader2 size={13} className="text-muted animate-spin shrink-0" />}
            </div>

            <ul
              ref={listRef}
              role="listbox"
              className="max-h-56 overflow-y-auto py-1"
            >
              {options.length === 0 ? (
                <li className="px-3 py-6 text-center text-xs text-muted">
                  {isLoading ? 'Loading…' : 'No results found'}
                </li>
              ) : (
                options.map((option, i) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(option); }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={cn(
                      'flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer transition-colors',
                      i === highlighted ? 'bg-accent-bg' : 'hover:bg-stone-50',
                      option.value === value && 'font-medium'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-fg truncate">{option.label}</p>
                      {option.sub && <p className="text-xs text-muted truncate">{option.sub}</p>}
                    </div>
                    {option.value === value && (
                      <Check size={13} className="text-accent shrink-0" />
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
