import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useRef, useState} from 'react';
import type {ProductCardProduct} from '~/types/storefront';
import {useVariantUrl} from '~/lib/variants';
import {ProductQuickAdd} from './ProductQuickAdd';

export function ProductItem({
  product,
  loading,
}: {
  product: ProductCardProduct;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const primaryImage = product.featuredImage ?? product.images.nodes[0];
  const images = primaryImage
    ? [
        primaryImage,
        ...product.images.nodes.filter((image) => image.id !== primaryImage.id),
      ].slice(0, 5)
    : product.images.nodes.slice(0, 5);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const price =
    product.selectedOrFirstAvailableVariant?.price ??
    product.priceRange.minVariantPrice;
  const compareAtPrice =
    product.selectedOrFirstAvailableVariant?.compareAtPrice;
  const isOnSale =
    compareAtPrice && Number(compareAtPrice.amount) > Number(price.amount);
  const hasMultipleImages = images.length > 1;
  const showCarouselControls = images.length > 2;

  function showPreviousImage() {
    setActiveImageIndex((index) =>
      index === 0 ? images.length - 1 : index - 1,
    );
  }

  function showNextImage() {
    setActiveImageIndex((index) => (index + 1) % images.length);
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLAnchorElement>) {
    if (touchStartX.current === null) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 40 || !hasMultipleImages) return;

    didSwipe.current = true;
    if (distance > 0) showPreviousImage();
    else showNextImage();
  }

  return (
    <article
      className={`product-card ${
        hasMultipleImages ? 'product-card--has-secondary' : ''
      } ${activeImageIndex === 0 ? 'product-card--show-hover-preview' : ''}`}
    >
      <div className="product-card__media">
        <Link
          aria-label={`View ${product.title}`}
          className="product-card__media-link"
          onClick={(event) => {
            if (!didSwipe.current) return;
            event.preventDefault();
            didSwipe.current = false;
          }}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStartX.current = null;
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
          }}
          prefetch="intent"
          to={variantUrl}
        >
          {images.length ? (
            images.map((image, index) => (
              <Image
                alt=""
                aspectRatio="4/5"
                className={`product-card__image ${
                  index === activeImageIndex
                    ? 'product-card__image--active'
                    : ''
                } ${index === 1 ? 'product-card__image--hover-preview' : ''}`}
                data={image}
                key={image.id ?? image.url}
                loading={index === 0 ? loading : 'lazy'}
                sizes="(min-width: 750px) 25vw, 50vw"
              />
            ))
          ) : (
            <span aria-hidden="true" className="product-card__placeholder" />
          )}
        </Link>
        {showCarouselControls ? (
          <div className="product-card__carousel-controls">
            <button
              aria-label={`Previous image of ${product.title}`}
              className="product-card__carousel-button product-card__carousel-button--previous"
              onClick={showPreviousImage}
              type="button"
            >
              <span aria-hidden="true">&lsaquo;</span>
            </button>
            <button
              aria-label={`Next image of ${product.title}`}
              className="product-card__carousel-button product-card__carousel-button--next"
              onClick={showNextImage}
              type="button"
            >
              <span aria-hidden="true">&rsaquo;</span>
            </button>
          </div>
        ) : null}
        {hasMultipleImages ? (
          <span className="sr-only" aria-live="polite">
            Image {activeImageIndex + 1} of {images.length}
          </span>
        ) : null}
        {!product.availableForSale || isOnSale ? (
          <span
            className={`product-card__badge ${
              product.availableForSale
                ? 'product-card__badge--sale'
                : 'product-card__badge--sold-out'
            }`}
          >
            {product.availableForSale ? 'Sale' : 'Sold out'}
          </span>
        ) : null}
        <ProductQuickAdd product={product} />
      </div>
      <Link
        className="product-item product-card__details"
        prefetch="intent"
        to={variantUrl}
      >
        <h3 className="product-card__title">{product.title}</h3>
        <span aria-hidden="true" className="product-card__divider" />
        <span aria-label="Price" className="product-card__price" role="group">
          {isOnSale ? (
            <>
              <span className="sr-only">Sale price</span>
              <span className="product-card__sale-price">
                <Money data={price} />
              </span>
              <span className="sr-only">Regular price</span>
              <s className="product-card__compare-price">
                <Money data={compareAtPrice} />
              </s>
            </>
          ) : (
            <Money data={price} />
          )}
        </span>
      </Link>
    </article>
  );
}
