import {useEffect, useId, useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {ShopPayButton, type MappedProductOptions} from '@shopify/hydrogen';
import type {
  AttributeInput,
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import type {ProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from './AddToCartButton';
import {normalizeQuantityRule, QuantitySelector} from './QuantitySelector';
import {useAside} from './Aside';
import {
  EMPTY_GIFT_CARD_RECIPIENT,
  GiftCardRecipientFields,
} from './GiftCardRecipientFields';

export function ProductForm({
  isGiftCard,
  productOptions,
  selectedVariant,
  storeDomain,
}: {
  isGiftCard: boolean;
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  storeDomain?: string;
}) {
  const navigate = useNavigate();
  const quantityId = useId();
  const {open} = useAside();
  const selectedMinimum = selectedVariant?.quantityRule.minimum;
  const quantityRule = normalizeQuantityRule(selectedVariant?.quantityRule);
  const [quantity, setQuantity] = useState(quantityRule.minimum);
  const [giftCardRecipient, setGiftCardRecipient] = useState(
    EMPTY_GIFT_CARD_RECIPIENT,
  );
  const giftCardAttributes = getGiftCardAttributes(giftCardRecipient);
  const recipientEmailIsValid =
    giftCardRecipient.delivery === 'self' ||
    /^\S+@\S+\.\S+$/.test(giftCardRecipient.email.trim());

  useEffect(() => {
    setQuantity(normalizeQuantityRule({minimum: selectedMinimum}).minimum);
  }, [selectedMinimum]);

  return (
    <div className="product-form">
      <div className="product-form__options">
        {productOptions.map((option) => {
          if (option.optionValues.length === 1) return null;

          const selectedValue = option.optionValues.find(
            (value) => value.selected,
          )?.name;

          return (
            <fieldset className="product-option" key={option.name}>
              <legend>
                {option.name}
                {selectedValue ? <strong>{selectedValue}</strong> : null}
              </legend>
              <div className="product-option-values">
                {option.optionValues.map((value) => {
                  const {
                    name,
                    handle,
                    variantUriQuery,
                    selected,
                    available,
                    exists,
                    isDifferentProduct,
                    swatch,
                  } = value;
                  const className = `product-option-value${
                    selected ? ' product-option-value--selected' : ''
                  }${!available ? ' product-option-value--unavailable' : ''}`;
                  const content = (
                    <ProductOptionSwatch name={name} swatch={swatch} />
                  );

                  if (isDifferentProduct && available) {
                    return (
                      <Link
                        aria-current={selected ? 'true' : undefined}
                        className={className}
                        key={option.name + name}
                        prefetch="intent"
                        preventScrollReset
                        replace
                        to={`/products/${handle}?${variantUriQuery}`}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      aria-pressed={selected}
                      className={className}
                      disabled={!exists || !available}
                      key={option.name + name}
                      onClick={() => {
                        if (!selected) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                      title={available ? undefined : `${name} is unavailable`}
                      type="button"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      <div
        className={`product-purchase${isGiftCard ? ' product-purchase--gift-card' : ''}`}
      >
        {isGiftCard ? (
          <GiftCardRecipientFields
            details={giftCardRecipient}
            onChange={setGiftCardRecipient}
          />
        ) : null}
        <QuantitySelector
          id={quantityId}
          max={quantityRule.maximum}
          min={quantityRule.minimum}
          onChange={setQuantity}
          step={quantityRule.increment}
          value={quantity}
        />
        <div className="product-purchase__button-wrap">
          <AddToCartButton
            analytics={{
              products: selectedVariant
                ? [
                    {
                      productGid: selectedVariant.product.id,
                      name: selectedVariant.product.title,
                      price: selectedVariant.price.amount,
                      quantity,
                      variantGid: selectedVariant.id,
                      variantName: selectedVariant.title,
                    },
                  ]
                : [],
            }}
            className="product-purchase__add-button"
            disabled={
              !selectedVariant?.availableForSale || !recipientEmailIsValid
            }
            lines={
              selectedVariant
                ? [
                    {
                      attributes: giftCardAttributes,
                      merchandiseId: selectedVariant.id,
                      quantity,
                      selectedVariant,
                    },
                  ]
                : []
            }
            onClick={() => open('cart')}
          >
            {selectedVariant?.availableForSale
              ? recipientEmailIsValid
                ? 'Add to cart'
                : 'Enter recipient email'
              : 'Sold out'}
          </AddToCartButton>
          <p aria-live="polite" className="product-purchase__availability">
            {selectedVariant?.availableForSale
              ? 'In stock and ready to add'
              : 'This option is currently sold out'}
          </p>
          {selectedVariant?.availableForSale &&
          storeDomain &&
          (!isGiftCard || giftCardRecipient.delivery === 'self') ? (
            <div className="product-purchase__shop-pay">
              <ShopPayButton
                channel="hydrogen"
                storeDomain={storeDomain}
                variantIdsAndQuantities={[{id: selectedVariant.id, quantity}]}
                width="100%"
              />
            </div>
          ) : null}
          {isGiftCard && giftCardRecipient.delivery === 'recipient' ? (
            <p className="product-purchase__recipient-note">
              Add to cart to preserve the recipient and delivery details.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getGiftCardAttributes(
  details: typeof EMPTY_GIFT_CARD_RECIPIENT,
): AttributeInput[] | undefined {
  if (details.delivery === 'self') return undefined;

  const attributes: AttributeInput[] = [
    {key: 'Recipient email', value: details.email.trim()},
    {key: '__shopify_send_gift_card_to_recipient', value: 'on'},
    {key: '__shopify_offset', value: new Date().getTimezoneOffset().toString()},
  ];

  if (details.name.trim()) {
    attributes.push({key: 'Recipient name', value: details.name.trim()});
  }
  if (details.message.trim()) {
    attributes.push({key: 'Message', value: details.message.trim()});
  }
  if (details.sendOn) {
    attributes.push({key: 'Send on', value: details.sendOn});
  }

  return attributes;
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch>;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <span>{name}</span>;

  return (
    <span className="product-option-swatch-wrap">
      <span
        aria-hidden="true"
        className="product-option-swatch"
        style={{backgroundColor: color || 'transparent'}}
      >
        {image ? <img alt="" src={image} /> : null}
      </span>
      <span>{name}</span>
    </span>
  );
}
