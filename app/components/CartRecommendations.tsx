import {ProductItem} from '~/components/ProductItem';
import type {ProductCardProduct} from '~/types/storefront';

export function CartRecommendations({
  products,
}: {
  products: ProductCardProduct[];
}) {
  if (!products.length) return null;

  return (
    <section
      aria-labelledby="cart-recommendations-title"
      className="cart-recommendations"
    >
      <header>
        <p>You may also like</p>
        <h2 id="cart-recommendations-title">More to explore</h2>
      </header>
      <div className="cart-recommendations__grid">
        {products.map((product, index) => (
          <ProductItem
            key={product.id}
            loading={index < 2 ? 'eager' : 'lazy'}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
