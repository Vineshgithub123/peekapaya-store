import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({footer: footerPromise, header, publicStoreDomain}: FooterProps) {
  return (
    <footer className="site-footer">
      <p className="site-footer__brand">Peekapaya</p>
      <Suspense fallback={null}>
        <Await resolve={footerPromise}>
          {(footer) => (
            <FooterMenu
              menu={footer?.menu}
              primaryDomainUrl={header.shop.primaryDomain.url}
              publicStoreDomain={publicStoreDomain}
            />
          )}
        </Await>
      </Suspense>
    </footer>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: string;
  publicStoreDomain: string;
}) {
  const items = menu?.items.length ? menu.items : FALLBACK_FOOTER_MENU;

  return (
    <nav aria-label="Footer navigation" className="site-footer__menu">
      {items.map((item) => {
        if (!item.url) return null;
        const url = normalizeMenuUrl(item.url, primaryDomainUrl, publicStoreDomain);
        return url.startsWith('/') ? (
          <NavLink key={item.id} prefetch="intent" to={url}>
            {item.title}
          </NavLink>
        ) : (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = [
  {id: 'about', title: 'About', url: '/pages/about-us'},
  {id: 'contact', title: 'Contact', url: '/pages/contact'},
  {id: 'privacy', title: 'Privacy policy', url: '/policies/privacy-policy'},
  {id: 'refund', title: 'Refund policy', url: '/policies/refund-policy'},
];

function normalizeMenuUrl(url: string, primaryDomainUrl: string, publicStoreDomain: string) {
  if (!url.startsWith('http')) return url;

  if (url.includes('myshopify.com') || url.includes(publicStoreDomain) || url.includes(primaryDomainUrl)) {
    return new URL(url).pathname;
  }

  return url;
}
