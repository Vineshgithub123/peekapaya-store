import {Suspense} from 'react';
import {Await, redirect, useLoaderData, useRouteLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductRecommendations} from '~/components/ProductRecommendations';
import {ProductDisclosures} from '~/components/ProductDisclosures';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import type {ProductRecommendationCardFragment} from 'storefrontapi.generated';
import {
  filterProductsForAudience,
  normalizeResourceAudience,
} from '~/lib/audience';
import type {RootLoader} from '~/root';

export const meta: Route.MetaFunction = ({data}) => [
  {
    title:
      data?.product.seo.title ||
      `${data?.product.title ?? 'Product'} | Peekapaya`,
  },
  {
    name: 'description',
    content: data?.product.seo.description || data?.product.description,
  },
  {
    rel: 'canonical',
    href: `/products/${data?.product.handle}`,
  },
];

export async function loader(args: Route.LoaderArgs) {
  const {product} = await loadProduct(args);
  const recommendedProducts = loadRecommendations(
    args,
    product.id,
    product.audience?.value,
  );

  return {product, recommendedProducts};
}

async function loadProduct({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;

  if (!handle) throw new Error('Expected product handle to be defined');

  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  if (!product?.id) throw new Response(null, {status: 404});

  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product};
}

function loadRecommendations(
  args: Route.LoaderArgs,
  productId: string,
  audienceValue?: string | null,
): Promise<ProductRecommendationCardFragment[]> {
  return args.context.storefront
    .query(PRODUCT_RECOMMENDATIONS_QUERY, {variables: {productId}})
    .then(({productRecommendations}) =>
      filterProductsForAudience(
        productRecommendations ?? [],
        normalizeResourceAudience(audienceValue),
      ),
    )
    .catch((): ProductRecommendationCardFragment[] => []);
}

export default function Product() {
  const {product, recommendedProducts} = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  return (
    <>
      <div className="product-page">
        <ProductGallery
          images={product.images.nodes}
          productTitle={product.title}
          selectedImage={selectedVariant.image}
        />

        <section aria-labelledby="product-title" className="product-details">
          <div className="product-details__sticky">
            <header className="product-details__header">
              <p>{product.vendor}</p>
              <h1 id="product-title">{product.title}</h1>
              <span aria-hidden="true" />
              <ProductPrice
                compareAtPrice={selectedVariant.compareAtPrice}
                price={selectedVariant.price}
              />
              <p className="product-details__tax-note">
                <em>Price incl. of all taxes</em>
              </p>
            </header>

            {product.descriptionHtml ? (
              <div
                className="product-details__description rte"
                dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
              />
            ) : null}

            <ProductForm
              isGiftCard={product.isGiftCard}
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              storeDomain={
                rootData?.publicStoreDomain ||
                rootData?.header.shop.primaryDomain.url
              }
            />
          </div>
        </section>
      </div>

      <ProductDisclosures metafield={product.disclosures} />

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <Await resolve={recommendedProducts}>
          {(products) => <ProductRecommendations products={products} />}
        </Await>
      </Suspense>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              price: selectedVariant.price.amount,
              quantity: 1,
              title: product.title,
              variantId: selectedVariant.id,
              variantTitle: selectedVariant.title,
              vendor: product.vendor,
            },
          ],
        }}
      />
    </>
  );
}

function RelatedProductsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="related-products-loading"
      className="related-products"
    >
      <h2 id="related-products-loading">Related Products</h2>
      <p>Loading related products...</p>
    </section>
  );
}

const MONEY_FRAGMENT = `#graphql
  fragment ProductMoney on MoneyV2 {
    amount
    currencyCode
  }
` as const;

const IMAGE_FRAGMENT = `#graphql
  fragment ProductImageData on Image {
    id
    url
    altText
    width
    height
  }
` as const;

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      ...ProductMoney
    }
    id
    image {
      ...ProductImageData
    }
    price {
      ...ProductMoney
    }
    product {
      id
      title
      handle
    }
    quantityRule {
      increment
      maximum
      minimum
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      ...ProductMoney
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    isGiftCard
    audience: metafield(namespace: "custom", key: "audience") {
      value
    }
    descriptionHtml
    description
    disclosures: metafield(namespace: "shopify", key: "disclosure") {
      references(first: 20) {
        nodes {
          __typename
          ... on Metaobject {
            id
            title: field(key: "title") {
              type
              value
            }
            content: field(key: "content") {
              type
              value
            }
            displayPreferences: field(key: "display_preferences") {
              value
            }
            symbol: field(key: "symbol") {
              reference {
                __typename
                ... on MediaImage {
                  image {
                    ...ProductImageData
                  }
                }
              }
            }
          }
        }
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 12) {
      nodes {
        ...ProductImageData
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions,
      ignoreUnknownOptions: true,
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const PRODUCT_RECOMMENDATION_CARD_FRAGMENT = `#graphql
  fragment ProductRecommendationCard on Product {
    id
    title
    handle
    availableForSale
    audience: metafield(namespace: "custom", key: "audience") {
      value
    }
    featuredImage {
      ...ProductImageData
    }
    images(first: 5) {
      nodes {
        ...ProductImageData
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
        ...ProductMoney
      }
      compareAtPrice {
        ...ProductMoney
      }
      selectedOptions {
        name
        value
      }
      image {
        ...ProductImageData
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
          ...ProductMoney
        }
        compareAtPrice {
          ...ProductMoney
        }
        selectedOptions {
          name
          value
        }
        image {
          ...ProductImageData
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
        ...ProductMoney
      }
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations(
    $country: CountryCode
    $language: LanguageCode
    $productId: ID!
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductRecommendationCard
    }
  }
  ${PRODUCT_RECOMMENDATION_CARD_FRAGMENT}
` as const;
