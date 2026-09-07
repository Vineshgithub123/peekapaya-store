import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Image, Money} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {decodeOrderId} from '~/lib/orderId';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';

export const meta: Route.MetaFunction = ({data}) => [
  {
    title: data?.order?.name
      ? 'Order ' + data.order.name + ' | Peekapaya'
      : 'Order | Peekapaya',
  },
];

export async function loader({params, context}: Route.LoaderArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect('/account');
  if (!params.id) return redirect('/account/orders');

  let orderId: string;
  try {
    orderId = decodeOrderId(params.id);
  } catch {
    throw new Response('Invalid order reference', {status: 400});
  }

  const {customerAccount} = context;
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {orderId, language: customerAccount.i18n.language},
    });

  if (errors?.length || !data?.order) {
    throw new Response('Order not found', {status: 404});
  }

  const {order} = data;
  const firstDiscount = order.discountApplications.nodes[0]?.value;
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems: order.lineItems.nodes,
    discountValue,
    discountPercentage,
    fulfillmentStatus: order.fulfillments.nodes[0]?.status,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();

  return (
    <section aria-labelledby="order-heading" className="account-section">
      <Link className="account-back-link" to="/account/orders">
        <span aria-hidden="true">&lt;-</span> Back to orders
      </Link>

      <div className="account-section__heading">
        <h2 id="order-heading">Order {order.name}</h2>
        <p>
          Placed on {new Date(order.processedAt).toLocaleDateString()}
          {order.confirmationNumber
            ? ' / Confirmation ' + order.confirmationNumber
            : ''}
        </p>
      </div>

      <div className="account-order-detail__status">
        <div>
          <span>Order status</span>
          <strong>{formatStatus(order.fulfillmentStatus)}</strong>
        </div>
        <div>
          <span>Fulfillment</span>
          <strong>{formatStatus(fulfillmentStatus)}</strong>
        </div>
      </div>

      <div className="account-order-detail">
        <div className="account-order-table-wrapper">
          <table className="account-order-table">
            <caption className="sr-only">Items in order {order.name}</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Quantity</th>
                <th scope="col">Price</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((lineItem) => (
                <OrderLineRow key={lineItem.id} lineItem={lineItem} />
              ))}
            </tbody>
            <tfoot>
              {discountValue || discountPercentage ? (
                <tr>
                  <th colSpan={2} scope="row">
                    Discount
                  </th>
                  <td>
                    {discountPercentage ? (
                      <span>-{discountPercentage}%</span>
                    ) : discountValue ? (
                      <>
                        <span aria-hidden="true">-</span>
                        <Money data={discountValue} />
                      </>
                    ) : null}
                  </td>
                </tr>
              ) : null}
              <tr>
                <th colSpan={2} scope="row">
                  Subtotal
                </th>
                <td>
                  {order.subtotal ? <Money data={order.subtotal} /> : 'N/A'}
                </td>
              </tr>
              <tr>
                <th colSpan={2} scope="row">
                  Tax
                </th>
                <td>
                  {order.totalTax ? <Money data={order.totalTax} /> : 'N/A'}
                </td>
              </tr>
              <tr className="account-order-table__total">
                <th colSpan={2} scope="row">
                  Total
                </th>
                <td>
                  <Money data={order.totalPrice} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="account-order-detail__sidebar">
          <section>
            <h3>Shipping address</h3>
            {order.shippingAddress ? (
              <address>
                {order.shippingAddress.formatted.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                {order.shippingAddress.formattedArea ? (
                  <span>{order.shippingAddress.formattedArea}</span>
                ) : null}
              </address>
            ) : (
              <p>No shipping address is available.</p>
            )}
          </section>
          <a
            className="account-button account-button--secondary"
            href={order.statusPageUrl}
            rel="noreferrer"
            target="_blank"
          >
            View Shopify order status
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <tr>
      <td>
        <div className="account-order-line">
          {lineItem.image ? (
            <Image
              alt={lineItem.image.altText ?? lineItem.title}
              data={lineItem.image}
              height={96}
              width={96}
            />
          ) : (
            <span
              aria-hidden="true"
              className="account-order-line__placeholder"
            />
          )}
          <div>
            <strong>{lineItem.title}</strong>
            {lineItem.variantTitle ? (
              <span>{lineItem.variantTitle}</span>
            ) : null}
          </div>
        </div>
      </td>
      <td>{lineItem.quantity}</td>
      <td>{lineItem.price ? <Money data={lineItem.price} /> : 'N/A'}</td>
    </tr>
  );
}

function formatStatus(status?: string | null) {
  if (!status) return 'Not available';
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());
}
