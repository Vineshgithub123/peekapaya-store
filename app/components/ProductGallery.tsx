import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';

type ProductGalleryProps = {
  images: ProductFragment['images']['nodes'];
  productTitle: string;
  selectedImage?: NonNullable<
    ProductFragment['selectedOrFirstAvailableVariant']
  >['image'];
};

export function ProductGallery({
  images,
  productTitle,
  selectedImage,
}: ProductGalleryProps) {
  const galleryId = useId();
  const zoomDialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const galleryImages = useMemo(() => {
    if (!selectedImage) return images;
    return [
      selectedImage,
      ...images.filter((image) => image.id !== selectedImage.id),
    ];
  }, [images, selectedImage]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex];

  function showPreviousImage() {
    setActiveIndex((index) =>
      index === 0 ? galleryImages.length - 1 : index - 1,
    );
  }

  function showNextImage() {
    setActiveIndex((index) => (index + 1) % galleryImages.length);
  }

  useEffect(() => setActiveIndex(0), [selectedImage?.id]);

  if (!galleryImages.length) {
    return (
      <div
        aria-label="Product image unavailable"
        className="product-gallery__empty"
      />
    );
  }

  return (
    <section aria-label={`${productTitle} images`} className="product-gallery">
      <div
        className="product-gallery__grid"
        onTouchCancel={() => {
          touchStartX.current = null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null || galleryImages.length < 2) return;
          const distance =
            event.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(distance) < 40) return;
          didSwipe.current = true;
          if (distance > 0) showPreviousImage();
          else showNextImage();
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
      >
        {galleryImages.map((image, index) => (
          <button
            aria-label={`Zoom image ${index + 1} of ${galleryImages.length}`}
            className={`product-gallery__image-button${index === activeIndex ? ' product-gallery__image-button--active' : ''}`}
            key={image.id ?? image.url}
            onClick={() => {
              if (didSwipe.current) {
                didSwipe.current = false;
                return;
              }
              setActiveIndex(index);
              zoomDialogRef.current?.showModal();
            }}
            type="button"
          >
            <Image
              alt={image.altText ?? `${productTitle}, view ${index + 1}`}
              aspectRatio="1/1"
              data={image}
              loading={index < 2 ? 'eager' : 'lazy'}
              sizes="(min-width: 750px) 25vw, 100vw"
            />
          </button>
        ))}
      </div>

      {galleryImages.length > 1 ? (
        <div className="product-gallery__mobile-controls">
          <button
            aria-label="Previous product image"
            onClick={showPreviousImage}
            type="button"
          >
            &lsaquo;
          </button>
          <div
            aria-label="Choose product image"
            className="product-gallery__dots"
          >
            {galleryImages.map((image, index) => (
              <button
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === activeIndex}
                key={image.id ?? image.url}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
          <button
            aria-label="Next product image"
            onClick={showNextImage}
            type="button"
          >
            &rsaquo;
          </button>
        </div>
      ) : null}

      <span aria-live="polite" className="sr-only">
        Image {activeIndex + 1} of {galleryImages.length}
      </span>

      <dialog
        aria-labelledby={`${galleryId}-zoom-title`}
        className="product-gallery__zoom"
        ref={zoomDialogRef}
      >
        <h2 className="sr-only" id={`${galleryId}-zoom-title`}>
          Enlarged product image
        </h2>
        <button
          aria-label="Close enlarged image"
          onClick={() => zoomDialogRef.current?.close()}
          type="button"
        >
          &times;
        </button>
        {activeImage ? (
          <Image
            alt={activeImage.altText ?? productTitle}
            data={activeImage}
            sizes="90vw"
          />
        ) : null}
      </dialog>
    </section>
  );
}
