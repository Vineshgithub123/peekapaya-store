import {useEffect, useId, useRef, useState} from 'react';
import {Link} from 'react-router';
import type {ProductCardProduct, ProductCardVariant} from '~/types/storefront';
import {AddToCartButton} from './AddToCartButton';
import {normalizeQuantityRule, QuantitySelector} from './QuantitySelector';
import {useAside} from './Aside';
import {ProductPrice} from './ProductPrice';

export function ProductQuickAdd({product}: {product: ProductCardProduct}) {
  const {open} = useAside();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const quantityId = useId();
  const availableVariant = product.selectedOrFirstAvailableVariant
    ?.availableForSale
    ? product.selectedOrFirstAvailableVariant
    : product.variants.nodes.find((variant) => variant.availableForSale);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => optionsToRecord(availableVariant?.selectedOptions));
  const availableQuantityRule = normalizeQuantityRule(
    availableVariant?.quantityRule,
  );
  const [quantity, setQuantity] = useState(availableQuantityRule.minimum);
  const configurableOptions = product.options.filter(
    (option) => option.optionValues.length > 1,
  );
  const selectedVariant = findSelectedVariant(
    product.variants.nodes,
    selectedOptions,
  );
  const selectedMinimum = selectedVariant?.quantityRule.minimum;
  const selectedQuantityRule = normalizeQuantityRule(
    selectedVariant?.quantityRule,
  );
  const hasChoices = configurableOptions.length > 0;

  useEffect(() => {
    setQuantity(normalizeQuantityRule({minimum: selectedMinimum}).minimum);
  }, [selectedMinimum]);

  if (!availableVariant || !product.availableForSale) {
    return (
      <button className="product-card__quick-add" disabled type="button">
        Sold out
      </button>
    );
  }

  if (product.variants.pageInfo.hasNextPage) {
    return (
      <Link
        className="product-card__quick-add"
        to={`/products/${product.handle}`}
      >
        Choose options
      </Link>
    );
  }

  if (!hasChoices) {
    return (
      <AddToCartButton
        analytics={getCartAnalytics(
          product,
          availableVariant,
          availableQuantityRule.minimum,
        )}
        ariaLabel={`Add ${product.title} to cart`}
        className="product-card__quick-add"
        lines={[
          {
            merchandiseId: availableVariant.id,
            quantity: availableQuantityRule.minimum,
            selectedVariant: availableVariant,
          },
        ]}
        onClick={() => open('cart')}
        pendingText="Adding..."
      >
        Quick add
      </AddToCartButton>
    );
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="product-card__quick-add"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        Choose options
      </button>
      <dialog
        aria-labelledby={`${quantityId}-title`}
        className="quick-add-dialog"
        ref={dialogRef}
      >
        <div className="quick-add-dialog__content">
          <header>
            <div>
              <p className="quick-add-dialog__eyebrow">Quick add</p>
              <h2 id={`${quantityId}-title`}>{product.title}</h2>
            </div>
            <button
              aria-label="Close quick add"
              className="quick-add-dialog__close"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              &times;
            </button>
          </header>

          <div aria-live="polite" className="quick-add-dialog__price">
            <ProductPrice
              compareAtPrice={
                (selectedVariant ?? availableVariant).compareAtPrice
              }
              price={(selectedVariant ?? availableVariant).price}
            />
          </div>

          <VariantChoices
            onChange={(name, value) =>
              setSelectedOptions((current) => ({...current, [name]: value}))
            }
            options={configurableOptions}
            selectedOptions={selectedOptions}
            variants={product.variants.nodes}
          />

          <QuantitySelector
            id={`${quantityId}-quantity`}
            max={selectedQuantityRule.maximum}
            min={selectedQuantityRule.minimum}
            onChange={setQuantity}
            step={selectedQuantityRule.increment}
            value={quantity}
          />

          <p aria-live="polite" className="quick-add-dialog__availability">
            {selectedVariant?.availableForSale
              ? 'Available'
              : 'This combination is unavailable'}
          </p>

          <AddToCartButton
            analytics={
              selectedVariant
                ? getCartAnalytics(product, selectedVariant, quantity)
                : {products: []}
            }
            className="product-purchase__add-button"
            disabled={!selectedVariant?.availableForSale}
            lines={
              selectedVariant
                ? [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity,
                      selectedVariant,
                    },
                  ]
                : []
            }
            onClick={() => {
              dialogRef.current?.close();
              open('cart');
            }}
          >
            {selectedVariant?.availableForSale ? 'Add to cart' : 'Unavailable'}
          </AddToCartButton>
        </div>
      </dialog>
    </>
  );
}

function getCartAnalytics(
  product: ProductCardProduct,
  variant: ProductCardVariant,
  quantity: number,
) {
  return {
    products: [
      {
        name: product.title,
        price: variant.price.amount,
        productGid: product.id,
        quantity,
        variantGid: variant.id,
        variantName: variant.title,
      },
    ],
  };
}

type VariantChoicesProps = {
  onChange: (name: string, value: string) => void;
  options: ProductCardProduct['options'];
  selectedOptions: Record<string, string>;
  variants: ProductCardVariant[];
};

function VariantChoices({
  onChange,
  options,
  selectedOptions,
  variants,
}: VariantChoicesProps) {
  return (
    <div className="quick-add-dialog__options">
      {options.map((option) => (
        <fieldset key={option.name}>
          <legend>
            {option.name}: <strong>{selectedOptions[option.name]}</strong>
          </legend>
          <div className="product-option-values">
            {option.optionValues.map(({name: value}) => {
              const available = isOptionAvailable(
                variants,
                selectedOptions,
                option.name,
                value,
              );
              const selected = selectedOptions[option.name] === value;

              return (
                <button
                  aria-pressed={selected}
                  className={`product-option-value${selected ? ' product-option-value--selected' : ''}`}
                  disabled={!available}
                  key={value}
                  onClick={() => onChange(option.name, value)}
                  title={available ? undefined : `${value} is unavailable`}
                  type="button"
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function optionsToRecord(options?: Array<{name: string; value: string}>) {
  return Object.fromEntries(
    options?.map(({name, value}) => [name, value]) ?? [],
  );
}

function findSelectedVariant(
  variants: ProductCardVariant[],
  selectedOptions: Record<string, string>,
) {
  return variants.find((variant) =>
    variant.selectedOptions.every(
      ({name, value}) => selectedOptions[name] === value,
    ),
  );
}

function isOptionAvailable(
  variants: ProductCardVariant[],
  selectedOptions: Record<string, string>,
  optionName: string,
  optionValue: string,
) {
  return variants.some(
    (variant) =>
      variant.availableForSale &&
      variant.selectedOptions.every(({name, value}) =>
        name === optionName
          ? value === optionValue
          : value === selectedOptions[name],
      ),
  );
}
