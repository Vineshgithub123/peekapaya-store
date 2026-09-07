import {
  useCallback,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useId} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (expanded) {
      const panel = panelRef.current;
      const focusableElements = panel?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusableElements?.[0]?.focus();

      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }

          if (event.key === 'Tab' && focusableElements?.length) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            } else if (
              !event.shiftKey &&
              document.activeElement === lastElement
            ) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        },
        {signal: abortController.signal},
      );
    }

    return () => {
      abortController.abort();
      if (expanded) previouslyFocused?.focus();
    };
  }, [close, expanded]);

  return (
    <div
      aria-hidden={!expanded}
      aria-modal={expanded || undefined}
      className={`overlay overlay--${type} ${expanded ? 'expanded' : ''}`}
      role="dialog"
      aria-labelledby={id}
    >
      <button
        aria-label="Close panel"
        className="close-outside"
        onClick={close}
        tabIndex={expanded ? 0 : -1}
      />
      <aside className={`aside-panel aside-panel--${type}`} ref={panelRef}>
        {type === 'search' ? (
          <h2 className="sr-only" id={id}>
            {heading}
          </h2>
        ) : (
          <header>
            <h3 id={id}>{heading}</h3>
            <button className="close reset" onClick={close} aria-label="Close">
              &times;
            </button>
          </header>
        )}
        <div className="aside-content">{children}</div>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');
  const close = useCallback(() => setType('closed'), []);

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close,
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
