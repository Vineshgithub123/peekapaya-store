import type {ProductCardProduct} from '~/types/storefront';
import type {Audience} from '~/types/audience';

export type ResourceAudience = 'girl' | 'boy' | 'both' | null;

export function normalizeResourceAudience(value?: string | null): ResourceAudience {
  switch (value?.trim().toLowerCase()) {
    case 'girl':
    case 'girls':
      return 'girl';
    case 'boy':
    case 'boys':
      return 'boy';
    case 'both':
    case 'unisex':
      return 'both';
    default:
      return null;
  }
}

export function filterProductsForAudience<T extends ProductCardProduct>(
  products: T[],
  audience: Audience | ResourceAudience,
) {
  const target = normalizeResourceAudience(audience);
  if (!target || target === 'both') return products;

  return products.filter((product) => {
    const productAudience = normalizeResourceAudience(product.audience?.value);
    return !productAudience || productAudience === 'both' || productAudience === target;
  });
}
