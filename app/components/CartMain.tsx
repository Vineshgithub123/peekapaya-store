import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from '~/components/CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]) {
  const children: LineItemChildrenMap = {};

  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      children[parentId] = [...(children[parentId] ?? []), line];
    }

    if ('lineComponents' in line) {
      const nestedChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childLines] of Object.entries(nestedChildren)) {
        children[parentId] = [...(children[parentId] ?? []), ...childLines];
      }
    }
  }

  return children;
}

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = Boolean(cart?.totalQuantity && lines.length);
  const childrenMap = getLineItemChildrenMap(lines);

  if (!hasItems) return <CartEmpty layout={layout} />;

  return (
    <section
      aria-label={layout === 'page' ? 'Shopping cart' : 'Cart drawer'}
      className={`cart-main cart-main--${layout}`}
    >
      <div className="cart-details">
        <section
          aria-labelledby={`cart-lines-${layout}`}
          className="cart-items"
        >
          <h2 className="sr-only" id={`cart-lines-${layout}`}>
            Cart items
          </h2>
          <p aria-live="polite" className="cart-items__count">
            {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}{' '}
            in your cart
          </p>
          <ul className="cart-lines">
            {lines.map((line) => {
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }

              return (
                <CartLineItem
                  childrenMap={childrenMap}
                  key={line.id}
                  layout={layout}
                  line={line}
                />
              );
            })}
          </ul>
        </section>
        <CartSummary cart={cart} layout={layout} />
      </div>
    </section>
  );
}

function CartEmpty({layout}: {layout: CartLayout}) {
  const {close} = useAside();

  return (
    <section
      aria-labelledby={`empty-cart-title-${layout}`}
      className={`cart-empty cart-empty--${layout}`}
    >
      <span aria-hidden="true" className="cart-empty__icon">
        &#9786;
      </span>
      <h2 id={`empty-cart-title-${layout}`}>Your cart is empty</h2>
      <p>Find something special and it will appear here.</p>
      <Link
        className="cart-empty__link"
        onClick={layout === 'aside' ? close : undefined}
        prefetch="viewport"
        to="/collections/all"
      >
        Continue shopping
      </Link>
    </section>
  );
}
