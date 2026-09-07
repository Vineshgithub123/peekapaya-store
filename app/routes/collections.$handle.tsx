import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {Analytics, getPaginationVariables, Image} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {CollectionControls} from '~/components/CollectionControls';
import {CollectionProductListing} from '~/components/CollectionProductListing';
import {filterProductsForAudience, normalizeResourceAudience} from '~/lib/audience';
import {
  getCollectionListingState,
  getCollectionSort,
} from '~/lib/collectionFilters';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.collection) return [{title: 'Collection | Peekapaya'}];

  return [
    {title: data.collection.seo.title || `${data.collection.title} | Peekapaya`},
    {
      name: 'description',
      content: data.collection.seo.description || data.collection.description,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  return loadCriticalData(args);
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw redirect('/collections');

  const listingState = getCollectionListingState(request);
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});
  const sort = getCollectionSort(listingState.sort);
  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      filters: listingState.filters,
      handle,
      ...paginationVariables,
      ...sort,
    },
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  const collectionAudience = normalizeResourceAudience(collection.audience?.value);
  const products = {
    ...collection.products,
    nodes: filterProductsForAudience(
      collection.products.nodes,
      collectionAudience,
    ),
  };

  return {
    collection: {...collection, products},
    listingState,
  };
}

export default function Collection() {
  const {collection, listingState} = useLoaderData<typeof loader>();

  return (
    <main className="collection-page">
      <header
        className={`collection-hero ${
          collection.image ? 'collection-hero--image' : 'collection-hero--plain'
        }`}
      >
        {collection.image ? (
          <Image
            alt={collection.image.altText || ''}
            className="collection-hero__image"
            data={collection.image}
            loading="eager"
            sizes="100vw"
          />
        ) : null}
        <div className="collection-hero__content">
          <p className="collection-hero__eyebrow">Collection</p>
          <h1>{collection.title}</h1>
          {collection.description ? <p>{collection.description}</p> : null}
        </div>
      </header>

      <section aria-label={`${collection.title} products`} className="collection-listing">
        <CollectionControls
          filters={collection.products.filters}
          gridDensity={listingState.gridDensity}
          priceMax={listingState.priceMax}
          priceMin={listingState.priceMin}
          selectedFilters={listingState.selectedFilters}
          sort={listingState.sort}
        />
        <CollectionProductListing<ProductItemFragment>
          connection={collection.products}
          gridDensity={listingState.gridDensity}
        />
      </section>

      <Analytics.CollectionView
        data={{
          collection: {id: collection.id, handle: collection.handle},
        }}
      />
    </main>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      compareAtPrice {
        ...MoneyProductItem
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
          ...MoneyProductItem
        }
        compareAtPrice {
          ...MoneyProductItem
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      image {
        id
        url
        altText
        width
        height
      }
      audience: metafield(namespace: "custom", key: "audience") {
        value
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
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
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
