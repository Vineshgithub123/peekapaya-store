import {Await, Link} from 'react-router';
import {Suspense, useEffect, useId, useState} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside, useAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import closeIcon from '~/assets/icons/close.svg';
import searchIcon from '~/assets/icons/search.svg';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <CartAside cart={cart} />
      <SearchAside />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main className="storefront-main" id="main-content">
        {children}
      </main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside
      type="cart"
      heading={
        <span className="cart-drawer-heading">
          Cart
          <Suspense fallback={null}>
            <Await resolve={cart}>
              {(resolvedCart) => (
                <span
                  aria-label={`${resolvedCart?.totalQuantity ?? 0} items`}
                  className="cart-drawer-count"
                >
                  {resolvedCart?.totalQuantity ?? 0}
                </span>
              )}
            </Await>
          </Suspense>
        </span>
      }
    >
      <Suspense
        fallback={
          <div aria-label="Loading cart" className="cart-loading" role="status">
            <span />
            <span />
            <span />
          </div>
        }
      >
        <Await resolve={cart}>
          {(resolvedCart) => <CartMain cart={resolvedCart} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  const resultsId = useId();
  const [query, setQuery] = useState('');
  const {close, type: asideType} = useAside();

  useEffect(() => {
    if (asideType !== 'search') setQuery('');
  }, [asideType]);

  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <SearchFormPredictive role="search">
          {({fetchResults, inputRef, fetcher, resetSearch}) => (
            <div className="predictive-search__header">
              <div className="predictive-search__field">
                <img
                  alt=""
                  aria-hidden="true"
                  className="predictive-search__search-icon"
                  src={searchIcon}
                />
                <label className="sr-only" htmlFor="predictive-search-input">
                  Search our store
                </label>
                <input
                  aria-controls={resultsId}
                  autoComplete="off"
                  className="predictive-search__input"
                  id="predictive-search-input"
                  list={queriesDatalistId}
                  name="q"
                  onChange={(event) => {
                    setQuery(event.currentTarget.value);
                    fetchResults(event);
                  }}
                  onFocus={fetchResults}
                  placeholder="Search our store"
                  ref={inputRef}
                  type="search"
                  value={query}
                />
                {query ? (
                  <button
                    aria-label="Clear search"
                    className="predictive-search__clear"
                    onClick={() => {
                      setQuery('');
                      resetSearch();
                    }}
                    type="button"
                  >
                    <span className="predictive-search__clear-text">Clear</span>
                    <img
                      alt=""
                      aria-hidden="true"
                      className="predictive-search__clear-icon"
                      src={closeIcon}
                    />
                  </button>
                ) : null}
              </div>
              <button
                aria-label="Close search"
                className="predictive-search__close"
                onClick={close}
                type="button"
              >
                <img alt="" aria-hidden="true" src={closeIcon} />
              </button>
              <span className="sr-only" aria-live="polite">
                {fetcher.state === 'loading' && query ? 'Searching' : ''}
              </span>
            </div>
          )}
        </SearchFormPredictive>

        <div
          aria-live="polite"
          className="predictive-search__results"
          id={resultsId}
        >
          <SearchResultsPredictive>
            {({items, total, term, state, closeSearch}) => {
              const {articles, collections, pages, products, queries} = items;

              if (state === 'loading' && term.current) {
                return (
                  <p className="predictive-search__status" role="status">
                    Searching&hellip;
                  </p>
                );
              }

              if (!term.current && !query) {
                return (
                  <p className="predictive-search__prompt">
                    Start typing to search products and collections.
                  </p>
                );
              }

              if (!total) {
                return <SearchResultsPredictive.Empty term={term} />;
              }

              return (
                <>
                  <SearchResultsPredictive.Queries
                    queries={queries}
                    queriesDatalistId={queriesDatalistId}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Products
                    products={products}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Collections
                    collections={collections}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Pages
                    pages={pages}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Articles
                    articles={articles}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  {term.current && total ? (
                    <footer className="predictive-search__footer">
                      <Link
                        className="predictive-search__view-all"
                        onClick={closeSearch}
                        to={`${SEARCH_ENDPOINT}?q=${encodeURIComponent(term.current)}`}
                      >
                        View all results for <q>{term.current}</q>
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </footer>
                  ) : null}
                </>
              );
            }}
          </SearchResultsPredictive>
        </div>
      </div>
    </Aside>
  );
}
