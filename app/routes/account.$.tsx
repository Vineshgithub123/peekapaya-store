import {redirect} from 'react-router';
import type {Route} from './+types/account.$';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';

// fallback wild card for all unauthenticated routes in account section
export async function loader({context}: Route.LoaderArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect('/account');
  await context.customerAccount.handleAuthStatus();

  return redirect('/account');
}
