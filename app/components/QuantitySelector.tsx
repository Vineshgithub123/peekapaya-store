type QuantitySelectorProps = {
  id: string;
  label?: string;
  max?: number;
  min?: number;
  onChange: (quantity: number) => void;
  step?: number;
  value: number;
};

type ShopifyQuantityRule = {
  increment?: number | null;
  maximum?: number | null;
  minimum?: number | null;
};

export function normalizeQuantityRule(rule?: ShopifyQuantityRule | null) {
  const minimum = Math.max(1, rule?.minimum || 1);
  const increment = Math.max(1, rule?.increment || 1);
  const maximum =
    rule?.maximum && rule.maximum >= minimum ? rule.maximum : undefined;

  return {increment, maximum, minimum};
}

export function QuantitySelector({
  id,
  label = 'Quantity',
  max,
  min = 1,
  onChange,
  step = 1,
  value,
}: QuantitySelectorProps) {
  const normalize = (quantity: number) => {
    const steppedQuantity = min + Math.round((quantity - min) / step) * step;
    return Math.min(
      max ?? Number.POSITIVE_INFINITY,
      Math.max(min, steppedQuantity),
    );
  };

  return (
    <div className="quantity-control">
      <label htmlFor={id}>{label}</label>
      <div className="quantity-selector">
        <button
          aria-label="Decrease quantity"
          disabled={value <= min}
          onClick={() => onChange(normalize(value - step))}
          type="button"
        >
          <span aria-hidden="true">−</span>
        </button>
        <input
          id={id}
          inputMode="numeric"
          max={max}
          min={min}
          onChange={(event) => {
            const nextValue = Number(event.currentTarget.value);
            if (Number.isFinite(nextValue)) onChange(normalize(nextValue));
          }}
          step={step}
          type="number"
          value={value}
        />
        <button
          aria-label="Increase quantity"
          disabled={max !== undefined && value >= max}
          onClick={() => onChange(normalize(value + step))}
          type="button"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}
