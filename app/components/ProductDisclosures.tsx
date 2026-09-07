import {Image, RichText} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductDisclosures({
  metafield,
}: {
  metafield: ProductFragment['disclosures'];
}) {
  const disclosures = (metafield?.references?.nodes ?? []).flatMap((node) => {
    if (
      node.__typename !== 'Metaobject' ||
      !isVisibleOnProductPage(node.displayPreferences?.value)
    ) {
      return [];
    }

    const symbol =
      node.symbol?.reference?.__typename === 'MediaImage'
        ? node.symbol.reference.image
        : null;

    return [
      {
        content: node.content,
        id: node.id,
        symbol,
        title: node.title?.value || 'Product information',
      },
    ];
  });

  if (!disclosures.length) return null;

  return (
    <section
      aria-labelledby="product-disclosures-title"
      className="product-disclosures"
    >
      <h2 id="product-disclosures-title">Disclosures</h2>
      <details>
        <summary>
          <span className="product-disclosures__summary">
            {disclosures.map((disclosure, index) => (
              <span
                className="product-disclosures__summary-item"
                key={disclosure.id}
              >
                {disclosure.symbol ? (
                  <Image
                    alt=""
                    aria-hidden="true"
                    data={disclosure.symbol}
                    height={28}
                    width={28}
                  />
                ) : null}
                <span>{disclosure.title}</span>
                {index < disclosures.length - 1 ? (
                  <span aria-hidden="true">&bull;</span>
                ) : null}
              </span>
            ))}
          </span>
          <span aria-hidden="true" className="product-disclosures__caret">
            &#8964;
          </span>
        </summary>

        <div className="product-disclosures__content">
          {disclosures.map((disclosure) => (
            <article key={disclosure.id}>
              <header>
                {disclosure.symbol ? (
                  <Image
                    alt=""
                    aria-hidden="true"
                    data={disclosure.symbol}
                    height={40}
                    width={40}
                  />
                ) : null}
                <h3>{disclosure.title}</h3>
              </header>
              {disclosure.content?.value ? (
                disclosure.content.type === 'rich_text_field' ? (
                  <RichText data={disclosure.content.value} />
                ) : (
                  <p>{disclosure.content.value}</p>
                )
              ) : null}
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}

function isVisibleOnProductPage(value?: string | null) {
  if (!value) return false;

  try {
    const preferences = JSON.parse(value) as {surfaces?: unknown};
    return (
      Array.isArray(preferences.surfaces) &&
      preferences.surfaces.includes('product_page')
    );
  } catch {
    return false;
  }
}
