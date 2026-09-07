import {
  data as remixData,
  Form,
  Link,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!isCustomerAccountConfigured(context.env)) {
    return remixData(
      {configured: false as const, customer: null},
      {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
    );
  }

  await customerAccount.handleAuthStatus();
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {language: customerAccount.i18n.language},
  });

  if (errors?.length || !data?.customer) {
    throw new Error('We could not load your customer account.');
  }

  return remixData(
    {configured: true as const, customer: data.customer},
    {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
  );
}

export default function AccountLayout() {
  const {configured, customer} = useLoaderData<typeof loader>();

  if (!configured || !customer) {
    return (
      <main className="account-page account-page--unavailable">
        <section className="account-unavailable" role="status">
          <p className="account-page__eyebrow">My account</p>
          <h1>Customer accounts are temporarily unavailable</h1>
          <p>Please return soon or continue browsing the current collection.</p>
          <Link className="account-button account-button--primary" to="/collections">
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  const customerName = customer.firstName || customer.lastName;

  return (
    <div className="account-page">
      <header className="account-page__header">
        <p className="account-page__eyebrow">My account</p>
        <h1>{customerName ? `Welcome, ${customerName}` : 'Welcome'}</h1>
      </header>
      <AccountNavigation />
      <div className="account-page__content">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountNavigation() {
  const linkClassName = ({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) =>
    `account-navigation__link${isActive ? ' account-navigation__link--active' : ''}${
      isPending ? ' account-navigation__link--pending' : ''
    }`;

  return (
    <nav aria-label="Customer account" className="account-navigation">
      <ul>
        <li>
          <NavLink className={linkClassName} to="/account/orders">
            Orders
          </NavLink>
        </li>
        <li>
          <NavLink className={linkClassName} to="/account/profile">
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink className={linkClassName} to="/account/addresses">
            Addresses
          </NavLink>
        </li>
        <li>
          <Form action="/account/logout" method="POST">
            <button className="account-navigation__logout" type="submit">
              Sign out
            </button>
          </Form>
        </li>
      </ul>
    </nav>
  );
}
