import type {AudienceLandingQuery} from 'storefrontapi.generated';
import type {AudienceContent} from '~/types/audience';
import {filterProductsForAudience} from '~/lib/audience';

export const AUDIENCE_LANDING_QUERY = `#graphql
  query AudienceLanding(
    $audienceHandle: String!
    $collectionOneHandle: String!
    $collectionTwoHandle: String!
    $country: CountryCode
    $featuredHandle: String!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    featuredCollection: collection(handle: $featuredHandle) {
      products(first: 4) {
        nodes {
          ...AudienceProductCard
        }
      }
    }
    audienceCollection: collection(handle: $audienceHandle) {
      products(first: 12) {
        nodes {
          ...AudienceProductCard
        }
      }
    }
    collectionOne: collection(handle: $collectionOneHandle) {
      ...AudienceCollectionCard
    }
    collectionTwo: collection(handle: $collectionTwoHandle) {
      ...AudienceCollectionCard
    }
    fallbackProducts: products(first: 12, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...AudienceProductCard
      }
    }
  }

  fragment AudienceProductCard on Product {
    id
    title
    handle
    availableForSale
    audience: metafield(namespace: "custom", key: "audience") {
      value
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 5) {
      nodes {
        id
        url
        altText
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
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      image {
        id
        url
        altText
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
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        image {
          id
          url
          altText
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
        amount
        currencyCode
      }
    }
  }

  fragment AudienceCollectionCard on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
` as const;

export function getAudienceQueryVariables(content: AudienceContent) {
  return {
    audienceHandle: content.collectionHandle,
    collectionOneHandle: content.collectionHandles[0],
    collectionTwoHandle: content.collectionHandles[1],
    featuredHandle: content.featuredCollectionHandle,
  };
}

export function normalizeAudienceData(
  data: AudienceLandingQuery,
  content: AudienceContent,
) {
  const fallbackProducts = data.fallbackProducts.nodes;
  const featuredCandidates = data.featuredCollection?.products.nodes.length
    ? data.featuredCollection.products.nodes
    : fallbackProducts.slice(0, 4);
  const productCandidates = data.audienceCollection?.products.nodes.length
    ? data.audienceCollection.products.nodes
    : fallbackProducts;
  const featuredProducts = filterProductsForAudience(
    featuredCandidates,
    content.audience,
  );
  const products = filterProductsForAudience(productCandidates, content.audience);
  const collections = [data.collectionOne, data.collectionTwo].map(
    (collection, index) => {
      const handle = content.collectionHandles[index];
      return (
        collection ?? {
          id: handle,
          title: titleFromHandle(handle),
          handle,
          image: null,
        }
      );
    },
  );

  return {collections, featuredProducts, products};
}

function titleFromHandle(handle: string) {
  return handle
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
