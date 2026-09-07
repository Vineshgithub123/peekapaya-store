import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {CollectionControls} from '~/components/CollectionControls';
import {CollectionProductListing} from '~/components/CollectionProductListing';
import {
  buildCatalogQuery,
  getCatalogSort,
  getCollectionListingState,
  isCatalogFilterSupported,
} from '~/lib/collectionFilters';

export const meta: Route.MetaFunction = () => [
  {title: 'Shop All Products | Peekapaya'},
  {
    name: 'description',
    content: 'Browse all available Peekapaya products.',
  },
];

export async function loader({context, request}: Route.LoaderArgs) {
  const listingState = getCollectionListingState(request);
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});
  const sort = getCatalogSort(listingState.sort);
  const {products} = await context.storefront.query(CATALOG_QUERY, {
    variables: {
      ...paginationVariables,
      ...sort,
      query: buildCatalogQuery(listingState.filters),
    },
  });

  const filters = products.filters
    .map((filter) => ({
      ...filter,
      values: filter.values.filter((value) =>
        isCatalogFilterSupported(value.input),
      ),
    }))
    .filter((filter) =>
      filter.type === 'PRICE_RANGE' || filter.values.length > 0,
    );

  return {filters, listingState, products};
}

export default function Catalog() {
  const {filters, listingState, products} = useLoaderData<typeof loader>();

  return (
    <main className="collection-page">
      <header className="collection-hero collection-hero--plain collection-hero--catalog">
        <div className="collection-hero__content">
          <p className="collection-hero__eyebrow">Peekapaya</p>
          <h1>Shop all</h1>
          <p>Explore every style in the current collection.</p>
        </div>
      </header>
      <section aria-label="All products" className="collection-listing">
        <CollectionControls
          filters={filters}
          gridDensity={listingState.gridDensity}
          priceMax={listingState.priceMax}
          priceMin={listingState.priceMin}
          selectedFilters={listingState.selectedFilters}
          sort={listingState.sort}
        />
        <CollectionProductListing<CollectionItemFragment>
          connection={products}
          gridDensity={listingState.gridDensity}
        />
      </section>
    </main>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    availableForSale
    audience: metafield(namespace: "custom", key: "audience") {
      value
    }
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 5) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      title
      price {
        ...MoneyCollectionItem
      }
      compareAtPrice {
        ...MoneyCollectionItem
      }
      selectedOptions {
        name
        value
      }
      image {
        id
        altText
        url
        width
        height
      }
      product {
        handle
        title
      }
      quantityRule {
        increment
        maximum
        minimum
      }
    }
    variants(first: 100) {
      nodes {
        id
        availableForSale
        title
        price {
          ...MoneyCollectionItem
        }
        compareAtPrice {
          ...MoneyCollectionItem
        }
        selectedOptions {
          name
          value
        }
        image {
          id
          altText
          url
          width
          height
        }
        product {
          handle
          title
        }
        quantityRule {
          increment
          maximum
          minimum
        }
      }
      pageInfo {
        hasNextPage
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

const CATALOG_QUERY = `#graphql
  ${COLLECTION_ITEM_FRAGMENT}
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String
    $reverse: Boolean
    $sortKey: ProductSortKeys
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      query: $query
      reverse: $reverse
      sortKey: $sortKey
    ) {
      filters {
        id
        label
        type
        values {
          id
          label
          count
          input
          swatch {
            color
          }
        }
      }
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
` as const;
