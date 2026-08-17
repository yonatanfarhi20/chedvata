'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { getStudentId, getStudentInitials, STUDENT_NOT_FOUND_MESSAGE, STUDENT_SEARCH_DEBOUNCE_MS } from '@/lib/admin/students';
import { getUserFullName } from '@/lib/admin/users';
import { searchStudents } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

function StudentAvatar({ student, sizeClass = 'h-8 w-8' }) {
  const imageUrl = student?.profileImage;
  const initials = getStudentInitials(student);

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={`${sizeClass} rounded-full object-cover ring-1 ring-border`} />
    );
  }

  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-primary text-[0.65rem] font-semibold text-white`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default function StudentAutocomplete({
  id,
  label = 'תלמיד',
  selectedStudent = null,
  onSelect,
  error = '',
  disabled = false,
  required = false,
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listboxId = `${inputId}-listbox`;
  const errorId = `${inputId}-error`;
  const containerRef = useRef(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notFoundError, setNotFoundError] = useState('');

  const displayError = notFoundError || error;

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (selectedStudent || !trimmed) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setIsSearching(true);

      try {
        const data = await searchStudents(trimmed);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSuggestions(Array.isArray(data?.users) ? data.users : []);
        setNotFoundError('');
        setIsOpen(true);
      } catch (searchError) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (searchError instanceof ApiError && searchError.status === 401) {
          return;
        }

        setSuggestions([]);
        setIsOpen(false);

        if (searchError instanceof ApiError && searchError.status === 404) {
          setNotFoundError(
            searchError.data?.error || searchError.message || STUDENT_NOT_FOUND_MESSAGE,
          );
          return;
        }

        setNotFoundError(getErrorMessage(searchError, STUDENT_NOT_FOUND_MESSAGE));
      } finally {
        if (requestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, STUDENT_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [query, selectedStudent]);

  function handleChange(event) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setSuggestions([]);
    setIsOpen(false);
    setNotFoundError('');
    setIsSearching(false);

    if (selectedStudent) {
      onSelect?.(null);
    }
  }

  function handleSelect(student) {
    onSelect?.(student);
    setQuery('');
    setSuggestions([]);
    setNotFoundError('');
    setIsOpen(false);
    setIsSearching(false);
  }

  function handleClear() {
    onSelect?.(null);
    setQuery('');
    setSuggestions([]);
    setNotFoundError('');
    setIsOpen(false);
    setIsSearching(false);
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>

      {selectedStudent ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <StudentAvatar student={selectedStudent} />
            <span className="truncate font-medium text-foreground">{getUserFullName(selectedStudent)}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="shrink-0 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            נקה
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            id={inputId}
            type="search"
            role="combobox"
            aria-expanded={isOpen && suggestions.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-invalid={Boolean(displayError)}
            aria-describedby={displayError ? errorId : undefined}
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            disabled={disabled}
            autoComplete="off"
            placeholder="הקלידו שם תלמיד..."
            className={`w-full rounded-lg border bg-card px-3 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60 ${
              displayError
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15'
            }`}
          />

          {isSearching ? <p className="mt-1 text-xs text-muted">מחפש תלמידים...</p> : null}

          {isOpen && suggestions.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg"
            >
              {suggestions.map((student) => {
                const studentId = getStudentId(student);

                return (
                  <li key={studentId} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => handleSelect(student)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-start transition-colors hover:bg-background"
                    >
                      <StudentAvatar student={student} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {getUserFullName(student)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      )}

      {displayError ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-error">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
