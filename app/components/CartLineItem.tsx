import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {FetcherWithComponents} from 'react-router';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {
  CartForm,
  Image,
  Money,
  type OptimisticCartLine,
} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {normalizeQuantityRule} from '~/components/QuantitySelector';
import {useVariantUrl} from '~/lib/variants';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

type CartActionData = {
  errors?: Array<{message?: string}>;
  warnings?: Array<{message?: string}>;
};

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const visibleOptions = selectedOptions.filter(
    ({name, value}) => name !== 'Title' && value !== 'Default Title',
  );
  const visibleAttributes = (line.attributes ?? []).filter(
    ({key, value}) => !key.startsWith('_') && Boolean(value),
  );

  return (
    <li className="cart-line">
      <div className="cart-line__content">
        <Link
          aria-label={`View ${product.title}`}
          className="cart-line__image-link"
          onClick={layout === 'aside' ? close : undefined}
          prefetch="intent"
          to={lineItemUrl}
        >
          {image ? (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              className="cart-line__image"
              data={image}
              height={140}
              loading="lazy"
              width={140}
            />
          ) : (
            <span aria-hidden="true" className="cart-line__image-placeholder" />
          )}
        </Link>

        <div className="cart-line__details">
          <div className="cart-line__heading">
            <Link
              className="cart-line__title"
              onClick={layout === 'aside' ? close : undefined}
              prefetch="intent"
              to={lineItemUrl}
            >
              {product.title}
            </Link>
            <span className="cart-line__price">
              <Money data={line.cost?.totalAmount ?? merchandise.price} />
            </span>
          </div>

          {title !== 'Default Title' && !visibleOptions.length ? (
            <p className="cart-line__variant">{title}</p>
          ) : null}

          {visibleOptions.length ? (
            <dl className="cart-line__options">
              {visibleOptions.map((option) => (
                <div key={option.name}>
                  <dt>{option.name}:</dt>
                  <dd>{option.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {visibleAttributes.length ? (
            <dl className="cart-line__options">
              {visibleAttributes.map((attribute) => (
                <div key={attribute.key}>
                  <dt>{attribute.key}:</dt>
                  <dd>{attribute.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {!merchandise.availableForSale ? (
            <p className="cart-line__unavailable" role="status">
              This item is currently unavailable.
            </p>
          ) : null}

          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren?.length ? (
        <ul
          aria-label={`Items included with ${product.title}`}
          className="cart-line-children"
        >
          {lineItemChildren.map((childLine) => (
            <CartLineItem
              childrenMap={childrenMap}
              key={childLine.id}
              layout={layout}
              line={childLine}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (typeof line.quantity === 'undefined') return null;

  const {id: lineId, quantity, isOptimistic, merchandise} = line;
  const quantityRule = normalizeQuantityRule(merchandise.quantityRule);
  const previousQuantity = Math.max(
    quantityRule.minimum,
    quantity - quantityRule.increment,
  );
  const nextQuantity = quantity + quantityRule.increment;
  const atMinimum = quantity <= quantityRule.minimum;
  const atMaximum =
    quantityRule.maximum !== undefined && quantity >= quantityRule.maximum;

  return (
    <div className="cart-line__actions">
      <div aria-label="Quantity" className="cart-line-quantity" role="group">
        <CartLineUpdateButton
          disabled={atMinimum || Boolean(isOptimistic)}
          label="Decrease quantity"
          lineId={lineId}
          quantity={previousQuantity}
        >
          &minus;
        </CartLineUpdateButton>
        <output aria-live="polite" aria-label={`Quantity ${quantity}`}>
          {quantity}
        </output>
        <CartLineUpdateButton
          disabled={atMaximum || Boolean(isOptimistic)}
          label="Increase quantity"
          lineId={lineId}
          quantity={nextQuantity}
        >
          +
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton disabled={Boolean(isOptimistic)} lineId={lineId} />
    </div>
  );
}

function CartLineRemoveButton({
  lineId,
  disabled,
}: {
  lineId: string;
  disabled: boolean;
}) {
  return (
    <CartForm
      action={CartForm.ACTIONS.LinesRemove}
      fetcherKey={getUpdateKey(CartForm.ACTIONS.LinesRemove, [lineId])}
      inputs={{lineIds: [lineId]}}
      route="/cart"
    >
      {(fetcher: FetcherWithComponents<CartActionData>) => (
        <>
          <button
            aria-busy={fetcher.state !== 'idle' || undefined}
            className="cart-line__remove"
            disabled={disabled || fetcher.state !== 'idle'}
            type="submit"
          >
            {fetcher.state !== 'idle' ? 'Removing…' : 'Remove'}
          </button>
          <CartActionStatus data={fetcher.data} />
        </>
      )}
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  disabled,
  label,
  lineId,
  quantity,
}: {
  children: React.ReactNode;
  disabled: boolean;
  label: string;
  lineId: string;
  quantity: number;
}) {
  const lines: CartLineUpdateInput[] = [{id: lineId, quantity}];

  return (
    <CartForm
      action={CartForm.ACTIONS.LinesUpdate}
      fetcherKey={getUpdateKey(CartForm.ACTIONS.LinesUpdate, [lineId])}
      inputs={{lines}}
      route="/cart"
    >
      {(fetcher: FetcherWithComponents<CartActionData>) => (
        <>
          <button
            aria-label={label}
            disabled={disabled || fetcher.state !== 'idle'}
            type="submit"
          >
            <span aria-hidden="true">{children}</span>
          </button>
          <CartActionStatus data={fetcher.data} />
        </>
      )}
    </CartForm>
  );
}

function CartActionStatus({data}: {data?: CartActionData}) {
  const messages = [...(data?.errors ?? []), ...(data?.warnings ?? [])].flatMap(
    ({message}) => (message ? [message] : []),
  );

  if (!messages.length) return null;

  return (
    <p className="cart-action-message" role="alert">
      {messages.join(' ')}
    </p>
  );
}

function getUpdateKey(action: string, lineIds: string[]) {
  return [action, ...lineIds].join('-');
}
