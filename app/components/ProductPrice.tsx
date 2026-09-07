import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  const isOnSale =
    price &&
    compareAtPrice &&
    Number(compareAtPrice.amount) > Number(price.amount);

  return (
    <div aria-label="Price" className="product-price" role="group">
      {isOnSale ? (
        <div className="product-price-on-sale">
          <span className="sr-only">Sale price</span>
          <Money data={price} />
          <span className="sr-only">Regular price</span>
          <s>
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <Money data={price} />
      ) : (
        <span>Price unavailable</span>
      )}
    </div>
  );
}
