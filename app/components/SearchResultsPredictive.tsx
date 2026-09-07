import {Image, Money} from '@shopify/hydrogen';
import {Link, useFetcher, type Fetcher} from 'react-router';
import React, {useEffect, useRef} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {useAside} from './Aside';

type PredictiveSearchItems = PredictiveSearchReturn['result']['items'];

type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>;
  total: number;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  items: PredictiveSearchItems;
  fetcher: Fetcher<PredictiveSearchReturn>;
};

type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items'
> & {
  state: Fetcher['state'];
  closeSearch: () => void;
};

type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> &
  Pick<SearchResultsPredictiveArgs, ExtraProps>;

type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
};

export function SearchResultsPredictive({
  children,
}: SearchResultsPredictiveProps) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  function closeSearch() {
    if (inputRef.current) inputRef.current.value = '';
    aside.close();
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  if (!articles.length) return null;

  return (
    <SearchResultSection title="Articles" type="resources">
      {articles.map((article) => {
        const articleUrl = urlWithTrackingParams({
          baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
          trackingParams: article.trackingParameters,
          term: term.current,
        });

        return (
          <li className="predictive-search-result__card" key={article.id}>
            <Link
              className="predictive-search-result__link"
              onClick={closeSearch}
              to={articleUrl}
            >
              <SearchResultImage image={article.image} />
              <span className="predictive-search-result__title">
                {article.title}
              </span>
            </Link>
          </li>
        );
      })}
    </SearchResultSection>
  );
}

function SearchResultsPredictiveCollections({
  term,
  collections,
  closeSearch,
}: PartialPredictiveSearchResult<'collections'>) {
  if (!collections.length) return null;

  return (
    <SearchResultSection title="Collections" type="resources">
      {collections.map((collection) => {
        const collectionUrl = urlWithTrackingParams({
          baseUrl: `/collections/${collection.handle}`,
          trackingParams: collection.trackingParameters,
          term: term.current,
        });

        return (
          <li className="predictive-search-result__card" key={collection.id}>
            <Link
              className="predictive-search-result__link"
              onClick={closeSearch}
              to={collectionUrl}
            >
              <SearchResultImage image={collection.image} />
              <span className="predictive-search-result__title">
                {collection.title}
              </span>
            </Link>
          </li>
        );
      })}
    </SearchResultSection>
  );
}

function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  if (!pages.length) return null;

  return (
    <SearchResultSection title="Pages" type="resources">
      {pages.map((page) => {
        const pageUrl = urlWithTrackingParams({
          baseUrl: `/pages/${page.handle}`,
          trackingParams: page.trackingParameters,
          term: term.current,
        });

        return (
          <li className="predictive-search-result__card" key={page.id}>
            <Link
              className="predictive-search-result__link predictive-search-result__link--text"
              onClick={closeSearch}
              to={pageUrl}
            >
              <span className="predictive-search-result__title">
                {page.title}
              </span>
            </Link>
          </li>
        );
      })}
    </SearchResultSection>
  );
}

function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  if (!products.length) return null;

  return (
    <SearchResultSection title="Products" type="products">
      {products.map((product) => {
        const productUrl = urlWithTrackingParams({
          baseUrl: `/products/${product.handle}`,
          trackingParams: product.trackingParameters,
          term: term.current,
        });
        const variant = product.selectedOrFirstAvailableVariant;

        return (
          <li
            className="predictive-search-result__card predictive-search-result__card--product"
            key={product.id}
          >
            <Link
              className="predictive-search-result__link"
              onClick={closeSearch}
              to={productUrl}
            >
              <div className="predictive-search-result__media predictive-search-result__media--product">
                {variant?.image ? (
                  <Image
                    alt={variant.image.altText ?? product.title}
                    aspectRatio="4/5"
                    data={variant.image}
                    sizes="(min-width: 750px) 13vw, 42vw"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="predictive-search-result__image-placeholder"
                  />
                )}
              </div>
              <div className="predictive-search-result__content">
                <span className="predictive-search-result__title">
                  {product.title}
                </span>
                {variant?.price ? (
                  <span className="predictive-search-result__price">
                    <Money data={variant.price} />
                  </span>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </SearchResultSection>
  );
}

function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
  closeSearch,
}: PartialPredictiveSearchResult<'queries'> & {queriesDatalistId: string}) {
  if (!queries.length) return null;

  return (
    <>
      <datalist id={queriesDatalistId}>
        {queries.map((suggestion) => (
          <option key={suggestion.text} value={suggestion.text} />
        ))}
      </datalist>
      <section className="predictive-search-result predictive-search-result--queries">
        <h3>Suggestions</h3>
        <ul className="predictive-search-result__suggestions">
          {queries.map((suggestion) => (
            <li key={suggestion.text}>
              <Link
                onClick={closeSearch}
                to={urlWithTrackingParams({
                  baseUrl: '/search',
                  trackingParams: suggestion.trackingParameters,
                  term: suggestion.text,
                })}
              >
                {suggestion.text}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function SearchResultsPredictiveEmpty({
  term,
}: {
  term: React.MutableRefObject<string>;
}) {
  if (!term.current) return null;

  return (
    <p className="predictive-search__empty">
      No results found for <q>{term.current}</q>.
    </p>
  );
}

function SearchResultSection({
  children,
  title,
  type,
}: {
  children: React.ReactNode;
  title: string;
  type: 'products' | 'resources';
}) {
  return (
    <section
      className={`predictive-search-result predictive-search-result--${type}`}
    >
      <h3>{title}</h3>
      <ul
        className={`predictive-search-result__list predictive-search-result__list--${type}`}
      >
        {children}
      </ul>
    </section>
  );
}

function SearchResultImage({
  image,
}: {
  image?: {
    altText?: string | null;
    height?: number | null;
    url: string;
    width?: number | null;
  } | null;
}) {
  return (
    <div className="predictive-search-result__media">
      {image ? (
        <Image
          alt={image.altText ?? ''}
          aspectRatio="4/5"
          data={image}
          sizes="(min-width: 750px) 18vw, 55vw"
        />
      ) : (
        <span
          aria-hidden="true"
          className="predictive-search-result__image-placeholder"
        />
      )}
    </div>
  );
}

function usePredictiveSearch(): UsePredictiveSearchReturn {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const term = useRef('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (fetcher.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '');
  }

  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('#predictive-search-input');
    }
  }, []);

  const {items, total} =
    fetcher.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}
