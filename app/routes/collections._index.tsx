import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import type {CollectionFragment} from 'storefrontapi.generated';
import type {Route} from './+types/collections._index';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta: Route.MetaFunction = () => [
  {title: 'Collections | Peekapaya'},
  {
    name: 'description',
    content: 'Browse Peekapaya clothing collections for every little moment.',
  },
];

export async function loader({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const {collections} = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: paginationVariables,
  });

  return {collections};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <main className="collections-page">
      <header className="collections-page__header">
        <p>Find their next favourite</p>
        <h1>Shop by collection</h1>
      </header>
      {collections.nodes.length ? (
        <PaginatedResourceSection<CollectionFragment>
          ariaLabel="Collections"
          connection={collections}
          resourcesClassName="collections-page__grid"
        >
          {({node: collection, index}) => (
            <CollectionItem
              collection={collection}
              index={index}
              key={collection.id}
            />
          )}
        </PaginatedResourceSection>
      ) : (
        <div className="collection-empty-state" role="status">
          <h2>No collections are available yet</h2>
          <p>Published Shopify collections will appear here.</p>
        </div>
      )}
    </main>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      className="collections-page__card"
      prefetch="intent"
      to={`/collections/${collection.handle}`}
    >
      <span className="collections-page__media">
        {collection.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="16/11"
            data={collection.image}
            loading={index < 4 ? 'eager' : 'lazy'}
            sizes="(min-width: 990px) 33vw, (min-width: 600px) 50vw, 100vw"
          />
        ) : (
          <span aria-hidden="true" className="collections-page__placeholder" />
        )}
      </span>
      <span className="collections-page__content">
        <strong>{collection.title}</strong>
        {collection.description ? <span>{collection.description}</span> : null}
        <span className="collections-page__link">
          Shop collection <span aria-hidden="true">&rarr;</span>
        </span>
      </span>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    description(truncateAt: 120)
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: TITLE
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
