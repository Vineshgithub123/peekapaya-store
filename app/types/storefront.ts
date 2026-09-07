import type {Image, MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export interface ProductCardProduct {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  audience?: {value: string} | null;
  featuredImage?: Pick<
    Image,
    'id' | 'url' | 'altText' | 'width' | 'height'
  > | null;
  images: {
    nodes: Array<Pick<Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>;
  };
  priceRange: {
    minVariantPrice: Pick<MoneyV2, 'amount' | 'currencyCode'>;
  };
  options: Array<{
    name: string;
    optionValues: Array<{name: string}>;
  }>;
  variants: {
    nodes: ProductCardVariant[];
    pageInfo: {hasNextPage: boolean};
  };
  selectedOrFirstAvailableVariant?: {
    id: string;
    availableForSale: boolean;
    title: string;
    price: Pick<MoneyV2, 'amount' | 'currencyCode'>;
    compareAtPrice?: Pick<MoneyV2, 'amount' | 'currencyCode'> | null;
    selectedOptions: Array<{name: string; value: string}>;
    image?: Pick<Image, 'id' | 'url' | 'altText' | 'width' | 'height'> | null;
    product: {handle: string; title: string};
    quantityRule: ProductQuantityRule;
  } | null;
}

export interface ProductCardVariant {
  id: string;
  availableForSale: boolean;
  title: string;
  price: Pick<MoneyV2, 'amount' | 'currencyCode'>;
  compareAtPrice?: Pick<MoneyV2, 'amount' | 'currencyCode'> | null;
  selectedOptions: Array<{name: string; value: string}>;
  image?: Pick<Image, 'id' | 'url' | 'altText' | 'width' | 'height'> | null;
  product: {handle: string; title: string};
  quantityRule: ProductQuantityRule;
}

type ProductQuantityRule = {
  increment: number;
  maximum?: number | null;
  minimum: number;
};

export interface CollectionCardCollection {
  id: string;
  title: string;
  handle: string;
  image?: Pick<Image, 'id' | 'url' | 'altText' | 'width' | 'height'> | null;
}
