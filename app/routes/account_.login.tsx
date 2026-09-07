import type {Route} from './+types/account_.login';
import {redirect} from 'react-router';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';

export async function loader({request, context}: Route.LoaderArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect('/account');
  const url = new URL(request.url);
  const acrValues = url.searchParams.get('acr_values') || undefined;
  const loginHint = url.searchParams.get('login_hint') || undefined;
  const loginHintMode = url.searchParams.get('login_hint_mode') || undefined;
  const locale = url.searchParams.get('locale') || undefined;

  return context.customerAccount.login({
    countryCode: context.storefront.i18n.country,
    acrValues,
    loginHint,
    loginHintMode,
    locale,
  });
}
