import {
  Link,
  redirect,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {encodeOrderId} from '~/lib/orderId';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => [{title: 'Orders | Peekapaya'}];

export async function loader({request, context}: Route.LoaderArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect('/account');
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 20});
  const filters = parseOrderFilters(new URL(request.url).searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('We could not load your orders.');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();

  return (
    <section aria-labelledby="orders-heading" className="account-section">
      <div className="account-section__heading">
        <h2 id="orders-heading">Orders</h2>
        <p>Review your purchases and check their current status.</p>
      </div>
      <OrderSearchForm currentFilters={filters} />
      <OrdersList orders={customer.orders} filters={filters} />
    </section>
  );
}

function OrdersList({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = Boolean(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite" className="account-orders">
      {orders.nodes.length ? (
        <PaginatedResourceSection
          ariaLabel="Customer orders"
          connection={orders}
          resourcesClassName="account-order-list"
        >
          {({node: order}) => <OrderCard key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters}: {hasFilters: boolean}) {
  return (
    <div className="account-empty-state">
      <h3>{hasFilters ? 'No matching orders' : 'No orders yet'}</h3>
      <p>
        {hasFilters
          ? 'Try another order or confirmation number.'
          : 'Your completed orders will appear here.'}
      </p>
      <Link
        className="account-button account-button--secondary"
        to={hasFilters ? '/account/orders' : '/collections'}
      >
        {hasFilters ? 'Clear filters' : 'Start shopping'}
      </Link>
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname.includes('/account/orders');
  const hasFilters = Boolean(
    currentFilters.name || currentFilters.confirmationNumber,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const name = String(form.get(ORDER_FILTER_FIELDS.NAME) ?? '').trim();
    const confirmationNumber = String(
      form.get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER) ?? '',
    ).trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber) {
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);
    }
    setSearchParams(params);
  }

  return (
    <form
      aria-label="Filter orders"
      className="order-search-form"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <div className="order-search-inputs">
        <div className="account-field">
          <label htmlFor="order-number">Order number</label>
          <input
            defaultValue={currentFilters.name ?? ''}
            id="order-number"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="For example, 1001"
            type="search"
          />
        </div>
        <div className="account-field">
          <label htmlFor="confirmation-number">Confirmation number</label>
          <input
            defaultValue={currentFilters.confirmationNumber ?? ''}
            id="confirmation-number"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Confirmation number"
            type="search"
          />
        </div>
      </div>
      <div className="account-form__actions">
        <button
          className="account-button account-button--primary"
          disabled={isSearching}
          type="submit"
        >
          {isSearching ? 'Searching...' : 'Search orders'}
        </button>
        {hasFilters ? (
          <button
            className="account-button account-button--secondary"
            disabled={isSearching}
            onClick={() => {
              formRef.current?.reset();
              setSearchParams(new URLSearchParams());
            }}
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>
    </form>
  );
}

function OrderCard({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status ?? order.fulfillmentStatus;
  const orderUrl = '/account/orders/' + encodeOrderId(order.id);

  return (
    <article className="account-order-card">
      <header>
        <div>
          <p className="account-order-card__label">Order</p>
          <h3>#{order.number}</h3>
        </div>
        <p>{new Date(order.processedAt).toLocaleDateString()}</p>
      </header>
      <dl>
        {order.confirmationNumber ? (
          <div>
            <dt>Confirmation</dt>
            <dd>{order.confirmationNumber}</dd>
          </div>
        ) : null}
        <div>
          <dt>Payment</dt>
          <dd>{formatStatus(order.financialStatus)}</dd>
        </div>
        <div>
          <dt>Fulfillment</dt>
          <dd>{formatStatus(fulfillmentStatus)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>
            <Money data={order.totalPrice} />
          </dd>
        </div>
      </dl>
      <Link className="account-order-card__link" to={orderUrl}>
        View order <span aria-hidden="true">-&gt;</span>
      </Link>
    </article>
  );
}

function formatStatus(status?: string | null) {
  if (!status) return 'Not available';
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());
}
