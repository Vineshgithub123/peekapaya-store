import type {ProductCardProduct} from '~/types/storefront';
import {ProductItem} from './ProductItem';

export function ProductRecommendations({
  products,
}: {
  products: ProductCardProduct[];
}) {
  if (!products.length) return null;

  return (
    <section
      aria-labelledby="related-products-heading"
      className="related-products"
    >
      <h2 id="related-products-heading">Related Products</h2>
      <div className="product-card-grid">
        {products.slice(0, 8).map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
