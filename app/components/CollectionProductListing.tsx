import type {ProductCardProduct} from '~/types/storefront';
import type {GridDensity} from '~/lib/collectionFilters';
import {GridDensityControl} from './CollectionControls';
import {PaginatedResourceSection} from './PaginatedResourceSection';
import {ProductItem} from './ProductItem';

interface ProductConnection<T> {
  nodes: T[];
  pageInfo: {
    endCursor?: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string | null;
  };
}

export function CollectionProductListing<T extends ProductCardProduct>({
  connection,
  gridDensity,
}: {
  connection: ProductConnection<T>;
  gridDensity: GridDensity;
}) {
  if (!connection.nodes.length) {
    return (
      <div className="collection-empty-state" role="status">
        <h2>No products found</h2>
        <p>Try removing a filter or choosing a different price range.</p>
      </div>
    );
  }

  return (
    <>
      <div className="collection-listing__summary">
        <p aria-live="polite">
          Showing {connection.nodes.length}{' '}
          {connection.nodes.length === 1 ? 'product' : 'products'}
        </p>
        <GridDensityControl value={gridDensity} />
      </div>
      <PaginatedResourceSection<T>
        ariaLabel="Products"
        connection={connection}
        resourcesClassName={`collection-product-grid collection-product-grid--${gridDensity}`}
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            loading={index < 4 ? 'eager' : 'lazy'}
            product={product}
          />
        )}
      </PaginatedResourceSection>
    </>
  );
}
