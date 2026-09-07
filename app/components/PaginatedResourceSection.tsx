import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/** Reusable accessible previous and next pagination for Storefront API connections. */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div aria-busy={isLoading} className="pagination-section">
            <PreviousLink className="pagination-link pagination-link--previous">
              {isLoading ? (
                'Loading…'
              ) : (
                <span>
                  <span aria-hidden="true">&uarr;</span> Load previous
                </span>
              )}
            </PreviousLink>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}
            <NextLink className="pagination-link pagination-link--next">
              {isLoading ? (
                'Loading…'
              ) : (
                <span>
                  Load more <span aria-hidden="true">&darr;</span>
                </span>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
