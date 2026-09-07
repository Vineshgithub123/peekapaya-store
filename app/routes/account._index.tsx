import {redirect} from 'react-router';
import type {Route} from './+types/account._index';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';

export async function loader({context}: Route.LoaderArgs) {
  if (!isCustomerAccountConfigured(context.env)) return null;
  return redirect('/account/orders');
}

export default function AccountIndex() {
  return null;
}
