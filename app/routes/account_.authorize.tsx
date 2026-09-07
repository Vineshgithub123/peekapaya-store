import type {Route} from './+types/account_.authorize';
import {redirect} from 'react-router';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';

export async function loader({context}: Route.LoaderArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect('/account');
  return context.customerAccount.authorize();
}
