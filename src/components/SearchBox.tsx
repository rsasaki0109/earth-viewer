import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import type { GeocodeResult } from '../types/geocoding';
import { useGeocodingSearch } from '../hooks/useGeocodingSearch';
import geocodingProvider from '../services/geocoding';

export interface SearchBoxProps {
  /** Called when the user picks a candidate from the results list. */
  onSelectResult(result: GeocodeResult): void;
}

/**
 * Free-text place search backed by `geocodingProvider`. Typing debounces
 * automatically (handled inside `useGeocodingSearch`); Enter or the search
 * button run it immediately. The results list is keyboard-navigable.
 */
export function SearchBox({ onSelectResult }: SearchBoxProps): JSX.Element {
  const { query, setQuery, results, status, error, search } = useGeocodingSearch(geocodingProvider);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputId = useRef(`search-input-${Math.random().toString(36).slice(2)}`).current;
  const listboxId = useRef(`search-results-${Math.random().toString(36).slice(2)}`).current;

  const showList = results.length > 0;

  const selectResult = useCallback(
    (result: GeocodeResult) => {
      onSelectResult(result);
      setQuery('');
      setActiveIndex(-1);
    },
    [onSelectResult, setQuery],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        if (showList) {
          event.preventDefault();
          setActiveIndex((prev) => (prev + 1) % results.length);
        }
        return;
      }
      if (event.key === 'ArrowUp') {
        if (showList) {
          event.preventDefault();
          setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
        }
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          selectResult(results[activeIndex]);
        } else {
          search();
        }
        return;
      }
      if (event.key === 'Escape') {
        setActiveIndex(-1);
      }
    },
    [activeIndex, results, search, selectResult, showList],
  );

  return (
    <div className="search-box" role="search">
      <div className="search-box__row">
        <label htmlFor={inputId} className="visually-hidden">
          Search for a place
        </label>
        <input
          id={inputId}
          type="text"
          className="search-box__input"
          placeholder="Search for a place…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <button
          type="button"
          className="search-box__button"
          onClick={() => search()}
          aria-label="Search"
        >
          🔍
        </button>
      </div>

      {status === 'searching' && <p className="search-box__status">Searching…</p>}
      {status === 'empty' && <p className="search-box__status">No results found.</p>}
      {status === 'error' && (
        <p className="search-box__status search-box__status--error" role="alert">
          {error ?? 'Search failed.'}
        </p>
      )}

      {showList && (
        <ul id={listboxId} className="search-box__results" role="listbox" aria-label="Search results">
          {results.map((result, index) => (
            <li
              key={result.id}
              role="option"
              aria-selected={index === activeIndex}
              className={`search-box__result${index === activeIndex ? ' search-box__result--active' : ''}`}
            >
              <button type="button" onClick={() => selectResult(result)} onMouseEnter={() => setActiveIndex(index)}>
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
