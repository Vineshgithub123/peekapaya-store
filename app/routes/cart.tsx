import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {CartRecommendations} from '~/components/CartRecommendations';
import type {ProductCardProduct} from '~/types/storefront';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Cart | Peekapaya'}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    case CartForm.ACTIONS.NoteUpdate: {
      const formNote = formData.get('note');
      result = await cart.updateNote(
        typeof formNote === 'string' ? formNote : inputs.note,
      );
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const [cart, recommendedProducts] = await Promise.all([
    context.cart.get(),
    loadCartRecommendations(context),
  ]);

  return {cart, recommendedProducts};
}

async function loadCartRecommendations(
  context: Route.LoaderArgs['context'],
): Promise<ProductCardProduct[]> {
  try {
    const {products} = await context.storefront.query(
      CART_RECOMMENDATIONS_QUERY,
    );
    return products.nodes;
  } catch {
    return [];
  }
}

export default function Cart() {
  const {cart, recommendedProducts} = useLoaderData<typeof loader>();

  return (
    <div className="cart-page">
      <header className="cart-page__header">
        <p className="cart-page__eyebrow">Your selection</p>
        <h1>
          Cart <span>({cart?.totalQuantity ?? 0})</span>
        </h1>
      </header>
      <CartMain layout="page" cart={cart} />
      <CartRecommendations products={recommendedProducts} />
    </div>
  );
}

const CART_RECOMMENDATIONS_QUERY = `#graphql
  fragment CartRecommendationMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment CartRecommendationProduct on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 5) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      title
      price {
        ...CartRecommendationMoney
      }
      compareAtPrice {
        ...CartRecommendationMoney
      }
      selectedOptions {
        name
        value
      }
      image {
        id
        altText
        url
        width
        height
      }
      product {
        handle
        title
      }
      quantityRule {
        increment
        maximum
        minimum
      }
    }
    variants(first: 100) {
      nodes {
        id
        availableForSale
        title
        price {
          ...CartRecommendationMoney
        }
        compareAtPrice {
          ...CartRecommendationMoney
        }
        selectedOptions {
          name
          value
        }
        image {
          id
          altText
          url
          width
          height
        }
        product {
          handle
          title
        }
        quantityRule {
          increment
          maximum
          minimum
        }
      }
      pageInfo {
        hasNextPage
      }
    }
    priceRange {
      minVariantPrice {
        ...CartRecommendationMoney
      }
    }
  }
  query CartRecommendations($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 6, sortKey: BEST_SELLING) {
      nodes {
        ...CartRecommendationProduct
      }
    }
  }
` as const;
