import {Form, Link, useNavigation, useSearchParams} from 'react-router';
import {useId, useRef} from 'react';
import type {
  CollectionSortValue,
  GridDensity,
} from '~/lib/collectionFilters';
import {SORT_OPTIONS} from '~/lib/collectionFilters';

export interface StorefrontFilter {
  id: string;
  label: string;
  type: 'BOOLEAN' | 'LIST' | 'PRICE_RANGE';
  values: Array<{
    count: number;
    id: string;
    input: unknown;
    label: string;
    swatch?: {color?: string | null} | null;
  }>;
}

interface CollectionControlsProps {
  filters: StorefrontFilter[];
  gridDensity: GridDensity;
  priceMax: number | null;
  priceMin: number | null;
  selectedFilters: string[];
  sort: CollectionSortValue;
}

export function CollectionControls(props: CollectionControlsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';
  const controls = {
    ...props,
    filters: props.filters.length ? props.filters : DEFAULT_FILTERS,
  };
  const selectedCount = activeFilterCount(controls);

  return (
    <div aria-busy={isLoading} className="collection-controls">
      <div className="collection-controls__desktop">
        <FilterForm {...controls} idPrefix="desktop" />
      </div>
      <div className="collection-controls__mobile">
        <button
          className="collection-controls__open"
          onClick={() => dialogRef.current?.showModal()}
          type="button"
        >
          Filter and sort
          {selectedCount ? (
            <span aria-label={`${selectedCount} active filters`}>{selectedCount}</span>
          ) : null}
        </button>
        <dialog
          aria-labelledby="mobile-filter-heading"
          className="collection-controls__dialog"
          ref={dialogRef}
        >
          <div className="collection-controls__dialog-panel">
            <div className="collection-controls__dialog-header">
              <h2 id="mobile-filter-heading">Filter and sort</h2>
              <button
                aria-label="Close filters"
                className="collection-controls__close"
                onClick={() => dialogRef.current?.close()}
                type="button"
              >
                ×
              </button>
            </div>
            <FilterForm {...controls} idPrefix="mobile" />
          </div>
        </dialog>
      </div>
      <ActiveFilters {...controls} />
      {isLoading ? (
        <p aria-live="polite" className="collection-controls__status">
          Updating products…
        </p>
      ) : null}
    </div>
  );
}

const DEFAULT_FILTERS: StorefrontFilter[] = [
  {
    id: 'filter-availability',
    label: 'Availability',
    type: 'BOOLEAN',
    values: [
      {
        count: 1,
        id: 'available',
        input: {available: true},
        label: 'In stock',
      },
      {
        count: 1,
        id: 'unavailable',
        input: {available: false},
        label: 'Out of stock',
      },
    ],
  },
  {
    id: 'filter-price',
    label: 'Price',
    type: 'PRICE_RANGE',
    values: [
      {
        count: 1,
        id: 'price-range',
        input: {price: {min: 0}},
        label: 'Price',
      },
    ],
  },
];

function FilterForm({
  filters,
  gridDensity,
  priceMax,
  priceMin,
  selectedFilters,
  sort,
  idPrefix,
}: CollectionControlsProps & {idPrefix: string}) {
  const formId = useId();

  return (
    <Form className="collection-filter-form" method="get">
      <div className="collection-filter-form__groups">
        {filters.map((filter) =>
          filter.type === 'PRICE_RANGE' ? (
            <PriceFilter
              filter={filter}
              id={`${idPrefix}-${formId}-${filter.id}`}
              key={filter.id}
              priceMax={priceMax}
              priceMin={priceMin}
            />
          ) : (
            <ListFilter
              filter={filter}
              id={`${idPrefix}-${formId}-${filter.id}`}
              key={filter.id}
              selectedFilters={selectedFilters}
            />
          ),
        )}
      </div>

      <label className="collection-filter-form__sort">
        <span>Sort by</span>
        <select defaultValue={sort} name="sort">
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <input name="view" type="hidden" value={gridDensity} />
      <button className="collection-filter-form__apply" type="submit">
        Apply
      </button>
    </Form>
  );
}

function ListFilter({
  filter,
  id,
  selectedFilters,
}: {
  filter: StorefrontFilter;
  id: string;
  selectedFilters: string[];
}) {
  return (
    <details className="collection-filter">
      <summary>{filter.label}</summary>
      <fieldset>
        <legend className="sr-only">{filter.label}</legend>
        {filter.values.map((value) => {
          const serializedInput = JSON.stringify(value.input);
          const inputId = `${id}-${value.id}`.replaceAll(/[^a-zA-Z0-9_-]/g, '-');
          const isSelected = selectedFilters.includes(serializedInput);

          return (
            <label className="collection-filter__value" htmlFor={inputId} key={value.id}>
              <input
                defaultChecked={isSelected}
                disabled={value.count === 0 && !isSelected}
                id={inputId}
                name="filter"
                type="checkbox"
                value={serializedInput}
              />
              {value.swatch?.color ? (
                <span
                  aria-hidden="true"
                  className="collection-filter__swatch"
                  style={{backgroundColor: value.swatch.color}}
                />
              ) : null}
              <span>{value.label}</span>
              <span aria-label={`${value.count} products`} className="collection-filter__count">
                {value.count}
              </span>
            </label>
          );
        })}
      </fieldset>
    </details>
  );
}

function PriceFilter({
  filter,
  id,
  priceMax,
  priceMin,
}: {
  filter: StorefrontFilter;
  id: string;
  priceMax: number | null;
  priceMin: number | null;
}) {
  const availableMaximum = getAvailableMaximum(filter);

  return (
    <details className="collection-filter">
      <summary>{filter.label}</summary>
      <fieldset className="collection-filter__price">
        <legend className="sr-only">{filter.label}</legend>
        <label htmlFor={`${id}-min`}>
          <span>Minimum</span>
          <input
            defaultValue={priceMin ?? ''}
            id={`${id}-min`}
            max={availableMaximum}
            min="0"
            name="priceMin"
            placeholder="0"
            step="0.01"
            type="number"
          />
        </label>
        <label htmlFor={`${id}-max`}>
          <span>Maximum</span>
          <input
            defaultValue={priceMax ?? ''}
            id={`${id}-max`}
            max={availableMaximum}
            min="0"
            name="priceMax"
            placeholder={availableMaximum ? String(availableMaximum) : undefined}
            step="0.01"
            type="number"
          />
        </label>
      </fieldset>
    </details>
  );
}

function ActiveFilters(props: CollectionControlsProps) {
  const [searchParams] = useSearchParams();
  const activeFilters = props.selectedFilters.map((input) => ({
    input,
    label: findFilterLabel(props.filters, input),
  }));
  const hasPrice = props.priceMin != null || props.priceMax != null;

  if (!activeFilters.length && !hasPrice) return null;

  return (
    <div aria-label="Active filters" className="collection-active-filters">
      {activeFilters.map(({input, label}) => (
        <Link key={input} preventScrollReset to={removeFilter(searchParams, input)}>
          {label} <span aria-hidden="true">×</span>
        </Link>
      ))}
      {hasPrice ? (
        <Link preventScrollReset to={removePrice(searchParams)}>
          {priceLabel(props.priceMin, props.priceMax)} <span aria-hidden="true">×</span>
        </Link>
      ) : null}
      <Link
        className="collection-active-filters__clear"
        preventScrollReset
        to={clearFilters(searchParams)}
      >
        Clear all
      </Link>
    </div>
  );
}

export function GridDensityControl({value}: {value: GridDensity}) {
  const [searchParams] = useSearchParams();

  return (
    <div aria-label="Product grid density" className="collection-density" role="group">
      <span>View</span>
      <Link
        aria-label="Comfortable product grid"
        aria-pressed={value === 'comfortable'}
        className={value === 'comfortable' ? 'is-active' : undefined}
        preventScrollReset
        role="button"
        to={setGridDensity(searchParams, 'comfortable')}
      >
        <span aria-hidden="true">▦</span>
      </Link>
      <Link
        aria-label="Compact product grid"
        aria-pressed={value === 'compact'}
        className={value === 'compact' ? 'is-active' : undefined}
        preventScrollReset
        role="button"
        to={setGridDensity(searchParams, 'compact')}
      >
        <span aria-hidden="true">▦▦</span>
      </Link>
    </div>
  );
}

function findFilterLabel(filters: StorefrontFilter[], input: string) {
  for (const filter of filters) {
    const value = filter.values.find((item) => JSON.stringify(item.input) === input);
    if (value) return value.label;
  }
  return 'Filter';
}

function getAvailableMaximum(filter: StorefrontFilter) {
  const input = filter.values[0]?.input;
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const price = (input as {price?: {max?: unknown}}).price;
  return typeof price?.max === 'number' ? price.max : undefined;
}

function activeFilterCount(props: CollectionControlsProps) {
  return props.selectedFilters.length +
    (props.priceMin != null || props.priceMax != null ? 1 : 0);
}

function removeFilter(searchParams: URLSearchParams, input: string) {
  const next = cleanPagination(searchParams);
  const remaining = next.getAll('filter').filter((value) => value !== input);
  next.delete('filter');
  remaining.forEach((value) => next.append('filter', value));
  return toSearch(next);
}

function removePrice(searchParams: URLSearchParams) {
  const next = cleanPagination(searchParams);
  next.delete('priceMin');
  next.delete('priceMax');
  return toSearch(next);
}

function clearFilters(searchParams: URLSearchParams) {
  const next = cleanPagination(searchParams);
  next.delete('filter');
  next.delete('priceMin');
  next.delete('priceMax');
  return toSearch(next);
}

function setGridDensity(searchParams: URLSearchParams, density: GridDensity) {
  const next = cleanPagination(searchParams);
  next.set('view', density);
  return toSearch(next);
}

function cleanPagination(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams);
  ['cursor', 'direction', 'startCursor', 'endCursor'].forEach((key) => next.delete(key));
  return next;
}

function toSearch(searchParams: URLSearchParams) {
  const value = searchParams.toString();
  return value ? `?${value}` : '?';
}

function priceLabel(min: number | null, max: number | null) {
  if (min != null && max != null) return `${min}–${max}`;
  if (min != null) return `From ${min}`;
  return `Up to ${max}`;
}
