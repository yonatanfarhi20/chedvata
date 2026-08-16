'use client';

import { SearchIcon } from '@/components/layout/TopbarIcons';

export default function TopbarSearch({
  id = 'admin-global-search',
  value,
  onChange,
  placeholder = 'חיפוש תלמיד...',
  onSubmit,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(value);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <label htmlFor={id} className="sr-only">
        חיפוש תלמיד
      </label>
      <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted">
        <SearchIcon />
      </span>
      <input
        id={id}
        type="search"
        name="studentSearch"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-background py-2 ps-10 pe-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </form>
  );
}
