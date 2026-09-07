import type {
  ProductCollectionSortKeys,
  ProductFilter,
  ProductSortKeys,
} from '@shopify/hydrogen/storefront-api-types';

export type CollectionSortValue =
  | 'featured'
  | 'best-selling'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'title-asc'
  | 'title-desc';

export type GridDensity = 'comfortable' | 'compact';

export const SORT_OPTIONS: Array<{
  label: string;
  value: CollectionSortValue;
}> = [
  {label: 'Featured', value: 'featured'},
  {label: 'Best selling', value: 'best-selling'},
  {label: 'Newest', value: 'newest'},
  {label: 'Price, low to high', value: 'price-asc'},
  {label: 'Price, high to low', value: 'price-desc'},
  {label: 'Alphabetically, A–Z', value: 'title-asc'},
  {label: 'Alphabetically, Z–A', value: 'title-desc'},
];

const FILTER_KEYS = new Set<keyof ProductFilter>([
  'available',
  'category',
  'price',
  'productMetafield',
  'productType',
  'productVendor',
  'tag',
  'taxonomyMetafield',
  'variantMetafield',
  'variantOption',
]);

export function getCollectionListingState(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const sort = parseSortValue(searchParams.get('sort'));

  return {
    filters: parseProductFilters(searchParams),
    gridDensity: parseGridDensity(searchParams.get('view')),
    priceMax: parsePrice(searchParams.get('priceMax')),
    priceMin: parsePrice(searchParams.get('priceMin')),
    selectedFilters: searchParams.getAll('filter'),
    sort,
  };
}

export function getCollectionSort(sort: CollectionSortValue): {
  reverse: boolean;
  sortKey: ProductCollectionSortKeys;
} {
  switch (sort) {
    case 'best-selling':
      return {reverse: false, sortKey: 'BEST_SELLING'};
    case 'newest':
      return {reverse: true, sortKey: 'CREATED'};
    case 'price-asc':
      return {reverse: false, sortKey: 'PRICE'};
    case 'price-desc':
      return {reverse: true, sortKey: 'PRICE'};
    case 'title-asc':
      return {reverse: false, sortKey: 'TITLE'};
    case 'title-desc':
      return {reverse: true, sortKey: 'TITLE'};
    default:
      return {reverse: false, sortKey: 'COLLECTION_DEFAULT'};
  }
}

export function getCatalogSort(sort: CollectionSortValue): {
  reverse: boolean;
  sortKey: ProductSortKeys;
} {
  switch (sort) {
    case 'best-selling':
    case 'featured':
      return {reverse: false, sortKey: 'BEST_SELLING'};
    case 'newest':
      return {reverse: true, sortKey: 'CREATED_AT'};
    case 'price-asc':
      return {reverse: false, sortKey: 'PRICE'};
    case 'price-desc':
      return {reverse: true, sortKey: 'PRICE'};
    case 'title-asc':
      return {reverse: false, sortKey: 'TITLE'};
    case 'title-desc':
      return {reverse: true, sortKey: 'TITLE'};
  }
}

export function buildCatalogQuery(filters: ProductFilter[]) {
  return filters
    .flatMap((filter) => {
      const terms: string[] = [];

      if (typeof filter.available === 'boolean') {
        terms.push(`available_for_sale:${filter.available}`);
      }
      if (filter.productVendor) {
        terms.push(`vendor:${quoteSearchValue(filter.productVendor)}`);
      }
      if (filter.productType) {
        terms.push(`product_type:${quoteSearchValue(filter.productType)}`);
      }
      if (filter.tag) {
        terms.push(`tag:${quoteSearchValue(filter.tag)}`);
      }
      if (filter.price?.min != null) {
        terms.push(`variants.price:>=${filter.price.min}`);
      }
      if (filter.price?.max != null) {
        terms.push(`variants.price:<=${filter.price.max}`);
      }

      return terms;
    })
    .join(' AND ');
}

export function isCatalogFilterSupported(input: unknown) {
  const filter = toProductFilter(input);
  if (!filter) return false;

  return Boolean(
    typeof filter.available === 'boolean' ||
      filter.productVendor ||
      filter.productType ||
      filter.tag ||
      filter.price,
  );
}

function parseProductFilters(searchParams: URLSearchParams) {
  const filters = searchParams
    .getAll('filter')
    .map((value) => {
      try {
        return toProductFilter(JSON.parse(value));
      } catch {
        return null;
      }
    })
    .filter((filter): filter is ProductFilter => Boolean(filter));

  const min = parsePrice(searchParams.get('priceMin'));
  const max = parsePrice(searchParams.get('priceMax'));
  if (min != null || max != null) {
    filters.push({price: {min, max}});
  }

  return filters;
}

function toProductFilter(value: unknown): ProductFilter | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (!entries.length || entries.some(([key]) => !FILTER_KEYS.has(key as keyof ProductFilter))) {
    return null;
  }
  return value as ProductFilter;
}

function parseSortValue(value: string | null): CollectionSortValue {
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as CollectionSortValue)
    : 'featured';
}

function parseGridDensity(value: string | null): GridDensity {
  return value === 'compact' ? 'compact' : 'comfortable';
}

function parsePrice(value: string | null) {
  if (!value?.trim()) return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function quoteSearchValue(value: string) {
  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}
