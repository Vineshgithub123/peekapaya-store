import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function AddToCartButton({
  ariaLabel,
  analytics,
  children,
  className,
  disabled,
  lines,
  onClick,
  pendingText = 'Adding...',
}: {
  ariaLabel?: string;
  analytics?: unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  pendingText?: string;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        const isSubmitting = fetcher.state !== 'idle';

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              aria-busy={isSubmitting || undefined}
              aria-label={ariaLabel}
              className={className}
              disabled={Boolean(disabled) || isSubmitting}
              onClick={onClick}
              type="submit"
            >
              {isSubmitting ? pendingText : children}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}
