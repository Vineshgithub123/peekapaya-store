import {Suspense, useState} from 'react';
import {Await, NavLink, useAsyncValue, useLocation, useMatches} from 'react-router';
import {
  type CartViewPayload,
  Image,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import accountIcon from '~/assets/icons/account.svg';
import cartIcon from '~/assets/icons/cart.svg';
import searchIcon from '~/assets/icons/search.svg';
import logo from '~/assets/images/logo-primary-peekapaya.svg';
import {useAside} from '~/components/Aside';
import {FALLBACK_NAVIGATION} from '~/constants/navigation';
import {
  normalizeResourceAudience,
  type ResourceAudience,
} from '~/lib/audience';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({header, isLoggedIn, cart, publicStoreDomain}: HeaderProps) {
  const menuProps = {
    menu: header.menu,
    primaryDomainUrl: header.shop.primaryDomain.url,
    publicStoreDomain,
  };

  return (
    <header className="site-header">
      <div className="site-header__top">
        <SearchButton mobile />
        <NavLink className="site-header__brand" prefetch="intent" to="/" end>
          <img alt="Peekapaya" height="32" src={logo} />
        </NavLink>
        <HeaderMenu {...menuProps} viewport="desktop" />
        <HeaderActions isLoggedIn={isLoggedIn} cart={cart} />
      </div>
      <HeaderMenu {...menuProps} viewport="mobile" />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {pathname} = useLocation();
  const activeResourceAudience = getActiveResourceAudience(useMatches());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const isMockShop =
    !publicStoreDomain ||
    publicStoreDomain.includes('mock.shop') ||
    primaryDomainUrl.includes('mock.shop');
  const items = !isMockShop && menu?.items.length
    ? menu.items
    : FALLBACK_NAVIGATION.map(({label, to}) => ({id: to, title: label, url: to}));

  return (
    <nav
      aria-label={viewport === 'desktop' ? 'Main navigation' : 'Mobile navigation'}
      className={viewport === 'desktop' ? 'site-header__menu' : 'site-header__mobile-menu'}
    >
      <ul className="site-header__menu-list">
        {items.map((item, index) => {
          if (!item.url) return null;
          const url = normalizeMenuUrl(item.url, primaryDomainUrl, publicStoreDomain);
          const audienceActive = isAudienceLinkActive(
            item.title,
            url,
            pathname,
            activeResourceAudience,
          );
          const children = 'items' in item ? item.items : undefined;
          const hasSubmenu = viewport === 'desktop' && Boolean(children?.length);
          const isSubmenuOpen = hasSubmenu && openMenuId === item.id;
          const submenuId = `header-submenu-${index}`;

          return (
            // The list item owns the hover/focus boundary; its links remain the interactive controls.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li
              className={`site-header__menu-item${isSubmenuOpen ? ' site-header__menu-item--open' : ''}`}
              key={item.id}
              onBlur={(event) => {
                if (hasSubmenu && !event.currentTarget.contains(event.relatedTarget)) {
                  setOpenMenuId(null);
                }
              }}
              onFocus={() => hasSubmenu && setOpenMenuId(item.id)}
              onKeyDown={(event) => {
                if (event.key !== 'Escape' || !isSubmenuOpen) return;
                event.preventDefault();
                setOpenMenuId(null);
                event.currentTarget.querySelector<HTMLAnchorElement>(':scope > a')?.focus();
              }}
              onPointerEnter={() => hasSubmenu && setOpenMenuId(item.id)}
              onPointerLeave={() => hasSubmenu && setOpenMenuId(null)}
            >
              <NavLink
                aria-controls={hasSubmenu ? submenuId : undefined}
                aria-expanded={hasSubmenu ? isSubmenuOpen : undefined}
                aria-haspopup={hasSubmenu ? true : undefined}
                className={({isActive}) =>
                  `site-header__link${isActive || audienceActive ? ' site-header__link--active' : ''}`
                }
                end
                onClick={() => setOpenMenuId(null)}
                prefetch="intent"
                to={url}
              >
                <span>{item.title}</span>
              </NavLink>
              {hasSubmenu && children?.length ? (
                <div
                  aria-hidden={!isSubmenuOpen}
                  className="site-header__submenu"
                  id={submenuId}
                >
                  <ul className="site-header__submenu-list">
                    {children.map((child) => {
                      if (!child.url) return null;
                      const collectionImage =
                        child.resource && 'image' in child.resource
                          ? child.resource.image
                          : null;
                      return (
                        <li key={child.id}>
                          <NavLink
                            className="site-header__submenu-link"
                            onClick={() => setOpenMenuId(null)}
                            prefetch="intent"
                            to={normalizeMenuUrl(
                              child.url,
                              primaryDomainUrl,
                              publicStoreDomain,
                            )}
                          >
                            {collectionImage && (
                              <Image
                                alt={collectionImage.altText || child.title}
                                aspectRatio="16/9"
                                data={collectionImage}
                                loading="lazy"
                                sizes="180px"
                              />
                            )}
                            <span>{child.title}</span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HeaderActions({isLoggedIn, cart}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav aria-label="Store actions" className="site-header__actions">
      <SearchButton />
      <NavLink
        aria-label="Account"
        className="site-header__action site-header__account"
        prefetch="intent"
        to="/account"
      >
        <img alt="" aria-hidden="true" src={accountIcon} />
        <span className="sr-only">
          <Suspense fallback="Sign in">
            <Await resolve={isLoggedIn} errorElement="Sign in">
              {(loggedIn) => (loggedIn ? 'Account' : 'Sign in')}
            </Await>
          </Suspense>
        </span>
      </NavLink>
      <CartButton cart={cart} />
    </nav>
  );
}

function SearchButton({mobile = false}: {mobile?: boolean}) {
  const {open} = useAside();
  return (
    <button
      aria-label="Search"
      className={`site-header__action ${mobile ? 'site-header__mobile-search' : 'site-header__desktop-search'}`}
      onClick={() => open('search')}
      type="button"
    >
      <img alt="" aria-hidden="true" src={searchIcon} />
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      aria-label={`Cart with ${count} ${count === 1 ? 'item' : 'items'}`}
      className="site-header__action site-header__cart"
      href="/cart"
      onClick={(event) => {
        event.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href,
        } as CartViewPayload);
      }}
    >
      <img alt="" aria-hidden="true" src={cartIcon} />
      {count > 0 && <span className="site-header__cart-count">{count > 99 ? '99+' : count}</span>}
    </a>
  );
}

function CartButton({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <ResolvedCartButton />
      </Await>
    </Suspense>
  );
}

function ResolvedCartButton() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function normalizeMenuUrl(url: string, primaryDomainUrl: string, publicStoreDomain: string) {
  if (!url.startsWith('http')) return url;

  if (url.includes('myshopify.com') || url.includes(publicStoreDomain) || url.includes(primaryDomainUrl)) {
    return new URL(url).pathname;
  }

  return url;
}

function isAudienceLinkActive(
  title: string,
  url: string,
  pathname: string,
  activeResourceAudience: ResourceAudience,
) {
  const normalizedTitle = title.toLowerCase();
  const normalizedUrl = url.toLowerCase();
  const normalizedPath = pathname.toLowerCase();
  const audience = normalizedTitle.includes('girl') || normalizedUrl.includes('girl')
    ? 'girl'
    : normalizedTitle.includes('boy') || normalizedUrl.includes('boy')
      ? 'boy'
      : null;

  if (!audience) return false;
  if (activeResourceAudience && activeResourceAudience !== 'both') {
    return activeResourceAudience === audience;
  }
  return normalizedPath.includes(audience);
}

function getActiveResourceAudience(matches: ReturnType<typeof useMatches>) {
  for (const match of [...matches].reverse()) {
    if (!match.data || typeof match.data !== 'object') continue;
    const data = match.data as {
      collection?: {audience?: {value?: string | null} | null};
      product?: {audience?: {value?: string | null} | null};
    };
    const value = data.product?.audience?.value ?? data.collection?.audience?.value;
    const audience = normalizeResourceAudience(value);
    if (audience) return audience;
  }
  return null;
}
