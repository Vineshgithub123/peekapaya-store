import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useId, useState} from 'react';
import type {FetcherWithComponents} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';

type CartActionData = {
  errors?: Array<{message?: string}>;
  warnings?: Array<{message?: string}>;
};

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();

  return (
    <section
      aria-labelledby={summaryId}
      className={`cart-summary cart-summary--${layout}`}
    >
      <h2 id={summaryId}>Order summary</h2>
      <CartDiscounts discountCodes={cart.discountCodes} />
      <CartGiftCards giftCards={cart.appliedGiftCards} />
      <CartNote note={cart.note} />

      <dl className="cart-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>
            {cart.cost?.subtotalAmount ? (
              <Money data={cart.cost.subtotalAmount} />
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div className="cart-totals__total">
          <dt>Estimated total</dt>
          <dd>
            {cart.cost?.totalAmount ? (
              <Money data={cart.cost.totalAmount} />
            ) : (
              '—'
            )}
          </dd>
        </div>
      </dl>

      <p className="cart-summary__tax-note">
        Taxes, discounts and shipping are calculated at checkout.
      </p>
      <CartCheckoutAction checkoutUrl={cart.checkoutUrl} />
    </section>
  );
}

function CartCheckoutAction({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <a className="cart-checkout-button" href={checkoutUrl}>
      Check out
      <span aria-hidden="true">&rarr;</span>
    </a>
  );
}

function CartNote({note}: {note?: string | null}) {
  const noteId = useId();
  const [isOpen, setIsOpen] = useState(Boolean(note));

  return (
    <details
      className="cart-summary__disclosure"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={isOpen}
    >
      <summary>Add an order note</summary>
      <CartForm
        action={CartForm.ACTIONS.NoteUpdate}
        inputs={{note: note ?? ''}}
        route="/cart"
      >
        {(fetcher: FetcherWithComponents<CartActionData>) => (
          <div className="cart-note-form">
            <label className="sr-only" htmlFor={noteId}>
              Order note
            </label>
            <textarea
              defaultValue={note ?? ''}
              id={noteId}
              maxLength={500}
              name="note"
              placeholder="Add delivery instructions or a message"
              rows={3}
            />
            <button
              aria-busy={fetcher.state !== 'idle' || undefined}
              disabled={fetcher.state !== 'idle'}
              type="submit"
            >
              {fetcher.state !== 'idle' ? 'Saving…' : 'Save note'}
            </button>
            <CartFormStatus data={fetcher.data} successMessage="Note saved." />
          </div>
        )}
      </CartForm>
    </details>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const discountId = useId();
  const appliedCodes =
    discountCodes?.filter(({applicable}) => applicable).map(({code}) => code) ??
    [];
  const rejectedCodes =
    discountCodes
      ?.filter(({applicable}) => !applicable)
      .map(({code}) => code) ?? [];
  const [isOpen, setIsOpen] = useState(Boolean(discountCodes?.length));

  return (
    <details
      className="cart-summary__disclosure"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={isOpen}
    >
      <summary>Discount code</summary>
      <div className="cart-discounts">
        {appliedCodes.length ? (
          <ul aria-label="Applied discounts" className="cart-code-list">
            {appliedCodes.map((code) => (
              <li key={code}>
                <span>{code}</span>
                <CartForm
                  action={CartForm.ACTIONS.DiscountCodesUpdate}
                  inputs={{
                    discountCodes: appliedCodes.filter(
                      (appliedCode) => appliedCode !== code,
                    ),
                  }}
                  route="/cart"
                >
                  {(fetcher: FetcherWithComponents<CartActionData>) => (
                    <button
                      aria-label={`Remove discount ${code}`}
                      disabled={fetcher.state !== 'idle'}
                      type="submit"
                    >
                      &times;
                    </button>
                  )}
                </CartForm>
              </li>
            ))}
          </ul>
        ) : null}

        {rejectedCodes.length ? (
          <p className="cart-action-message" role="alert">
            {rejectedCodes.join(', ')} could not be applied to this cart.
          </p>
        ) : null}

        <CartForm
          action={CartForm.ACTIONS.DiscountCodesUpdate}
          inputs={{discountCodes: appliedCodes}}
          route="/cart"
        >
          {(fetcher: FetcherWithComponents<CartActionData>) => (
            <div className="cart-code-form">
              <label className="sr-only" htmlFor={discountId}>
                Discount code
              </label>
              <input
                autoComplete="off"
                id={discountId}
                name="discountCode"
                placeholder="Discount code"
                required
                type="text"
              />
              <button
                aria-busy={fetcher.state !== 'idle' || undefined}
                disabled={fetcher.state !== 'idle'}
                type="submit"
              >
                {fetcher.state !== 'idle' ? 'Applying…' : 'Apply'}
              </button>
              <CartFormStatus data={fetcher.data} />
            </div>
          )}
        </CartForm>
      </div>
    </details>
  );
}

function CartGiftCards({
  giftCards,
}: {
  giftCards?: CartApiQueryFragment['appliedGiftCards'];
}) {
  const giftCardId = useId();
  const [isOpen, setIsOpen] = useState(Boolean(giftCards?.length));

  return (
    <details
      className="cart-summary__disclosure"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={isOpen}
    >
      <summary>Gift card</summary>
      <div className="cart-discounts">
        {giftCards?.length ? (
          <ul aria-label="Applied gift cards" className="cart-code-list">
            {giftCards.map((giftCard) => (
              <li key={giftCard.id}>
                <span>
                  Ending in {giftCard.lastCharacters} &middot;{' '}
                  <Money data={giftCard.amountUsed} />
                </span>
                <CartForm
                  action={CartForm.ACTIONS.GiftCardCodesRemove}
                  inputs={{giftCardCodes: [giftCard.id]}}
                  route="/cart"
                >
                  {(fetcher: FetcherWithComponents<CartActionData>) => (
                    <button
                      aria-label={`Remove gift card ending in ${giftCard.lastCharacters}`}
                      disabled={fetcher.state !== 'idle'}
                      type="submit"
                    >
                      &times;
                    </button>
                  )}
                </CartForm>
              </li>
            ))}
          </ul>
        ) : null}

        <CartForm action={CartForm.ACTIONS.GiftCardCodesAdd} route="/cart">
          {(fetcher: FetcherWithComponents<CartActionData>) => (
            <div className="cart-code-form">
              <label className="sr-only" htmlFor={giftCardId}>
                Gift card code
              </label>
              <input
                autoComplete="off"
                id={giftCardId}
                name="giftCardCode"
                placeholder="Gift card code"
                required
                type="text"
              />
              <button
                aria-busy={fetcher.state !== 'idle' || undefined}
                disabled={fetcher.state !== 'idle'}
                type="submit"
              >
                {fetcher.state !== 'idle' ? 'Applying…' : 'Apply'}
              </button>
              <CartFormStatus data={fetcher.data} />
            </div>
          )}
        </CartForm>
      </div>
    </details>
  );
}

function CartFormStatus({
  data,
  successMessage,
}: {
  data?: CartActionData;
  successMessage?: string;
}) {
  const messages = [...(data?.errors ?? []), ...(data?.warnings ?? [])].flatMap(
    ({message}) => (message ? [message] : []),
  );

  if (messages.length) {
    return (
      <p className="cart-action-message" role="alert">
        {messages.join(' ')}
      </p>
    );
  }

  if (data && successMessage) {
    return (
      <p className="cart-action-success" role="status">
        {successMessage}
      </p>
    );
  }

  return null;
}
