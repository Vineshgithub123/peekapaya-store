import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import shippingDesktop from '~/assets/images/shipping-banner-desktop.png';
import shippingMobile from '~/assets/images/shipping-banner-mobile.png';
import {ProductItem} from '~/components/ProductItem';
import type {AudienceContent} from '~/types/audience';
import type {
  CollectionCardCollection,
  ProductCardProduct,
} from '~/types/storefront';

interface AudienceLandingPageProps {
  collections: CollectionCardCollection[];
  content: AudienceContent;
  featuredProducts: ProductCardProduct[];
  products: ProductCardProduct[];
}

export function AudienceLandingPage({
  collections,
  content,
  featuredProducts,
  products,
}: AudienceLandingPageProps) {
  return (
    <div className="audience-page">
      <h1 className="sr-only">{content.pageTitle}</h1>
      <Link
        aria-label={`Shop ${content.heroCollectionHandle.replaceAll('-', ' ')}`}
        className="audience-hero"
        to={`/collections/${content.heroCollectionHandle}`}
      >
        <picture>
          <source media="(max-width: 749px)" srcSet={content.heroMobileImage} />
          <img alt={content.heroAlt} src={content.heroDesktopImage} />
        </picture>
      </Link>

      <picture className="shipping-banner">
        <source media="(max-width: 749px)" srcSet={shippingMobile} />
        <img
          alt="Premium quality, secure payments, and free fast shipping"
          loading="eager"
          src={shippingDesktop}
        />
      </picture>

      <ProductSection
        products={featuredProducts}
        title={content.featuredTitle}
        variant="featured"
      />

      <CollectionSection collections={collections} />

      <ProductSection
        action={{label: 'Shop All', to: `/collections/${content.collectionHandle}`}}
        products={products}
        title="Explore Products"
        variant="explore"
      />
    </div>
  );
}

function ProductSection({
  action,
  products,
  title,
  variant,
}: {
  action?: {label: string; to: string};
  products: ProductCardProduct[];
  title: string;
  variant: 'featured' | 'explore';
}) {
  const headingId = `${title.toLowerCase().replaceAll(' ', '-')}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={`audience-section product-section product-section--${variant}`}
    >
      <div className="audience-section__heading">
        <h2 id={headingId}>{title}</h2>
      </div>
      <div className="product-card-grid">
        {products.map((product, index) => (
          <ProductItem key={product.id} loading={index < 4 ? 'eager' : 'lazy'} product={product} />
        ))}
      </div>
      {action && (
        <div className="audience-section__action">
          <Link className="button-primary-outline" to={action.to}>
            {action.label}
          </Link>
        </div>
      )}
    </section>
  );
}

function CollectionSection({collections}: {collections: CollectionCardCollection[]}) {
  return (
    <section aria-labelledby="shop-by-collection" className="audience-section collection-section">
      <div className="audience-section__heading">
        <h2 id="shop-by-collection">Shop by collection</h2>
      </div>
      <div className="collection-card-grid">
        {collections.map((collection) => (
          <Link
            className="collection-card"
            key={collection.id}
            prefetch="intent"
            to={`/collections/${collection.handle}`}
          >
            {collection.image ? (
              <Image
                alt={collection.image.altText || collection.title}
                aspectRatio="16/9"
                data={collection.image}
                loading="lazy"
                sizes="(min-width: 750px) 50vw, 100vw"
              />
            ) : (
              <span aria-hidden="true" className="collection-card__placeholder" />
            )}
            <span className="collection-card__title">{collection.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
