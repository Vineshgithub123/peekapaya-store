import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  redirect,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';

export type ActionResponse = {
  error: string | null;
  customer: {firstName?: string | null; lastName?: string | null} | null;
  success: boolean;
};

export const meta: Route.MetaFunction = () => [
  {title: 'My profile | Peekapaya'},
];

export async function loader({context}: Route.LoaderArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect('/account');
  await context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'PUT') {
    return data(
      {error: 'Method not allowed', customer: null, success: false},
      {status: 405},
    );
  }

  const form = await request.formData();
  const firstName = String(form.get('firstName') ?? '').trim();
  const lastName = String(form.get('lastName') ?? '').trim();

  if (firstName.length < 2 || lastName.length < 2) {
    return data(
      {
        error: 'First and last names must contain at least two characters.',
        customer: null,
        success: false,
      },
      {status: 400},
    );
  }

  try {
    const customer: CustomerUpdateInput = {firstName, lastName};
    const {customerAccount} = context;
    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {customer, language: customerAccount.i18n.language},
      },
    );

    if (errors?.length) throw new Error(errors[0].message);

    const userError = mutationData?.customerUpdate?.userErrors?.[0];
    if (userError) throw new Error(userError.message);

    const updatedCustomer = mutationData?.customerUpdate?.customer;
    if (!updatedCustomer) throw new Error('Customer profile update failed.');

    return {error: null, customer: updatedCustomer, success: true};
  } catch (error: unknown) {
    return data(
      {
        error:
          error instanceof Error ? error.message : 'Profile update failed.',
        customer: null,
        success: false,
      },
      {status: 400},
    );
  }
}

export default function AccountProfile() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const navigation = useNavigation();
  const action = useActionData<ActionResponse>();
  const isSubmitting = navigation.formMethod === 'PUT';
  const firstName = action?.customer?.firstName ?? customer.firstName ?? '';
  const lastName = action?.customer?.lastName ?? customer.lastName ?? '';

  return (
    <section aria-labelledby="profile-heading" className="account-section">
      <div className="account-section__heading">
        <h2 id="profile-heading">My profile</h2>
        <p>Update the name associated with your customer account.</p>
      </div>

      <Form className="account-form" method="PUT">
        <fieldset>
          <legend>Personal information</legend>
          <div className="account-form__grid">
            <div className="account-field">
              <label htmlFor="profile-first-name">First name</label>
              <input
                autoComplete="given-name"
                defaultValue={firstName}
                id="profile-first-name"
                minLength={2}
                name="firstName"
                required
                type="text"
              />
            </div>
            <div className="account-field">
              <label htmlFor="profile-last-name">Last name</label>
              <input
                autoComplete="family-name"
                defaultValue={lastName}
                id="profile-last-name"
                minLength={2}
                name="lastName"
                required
                type="text"
              />
            </div>
          </div>
        </fieldset>

        <div className="account-contact-details">
          <div>
            <span>Email</span>
            <strong>
              {customer.emailAddress?.emailAddress ?? 'Not provided'}
            </strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>
              {customer.phoneNumber?.phoneNumber ?? 'Not provided'}
            </strong>
          </div>
          <p>Email and phone verification are managed securely by Shopify.</p>
        </div>

        {action?.error ? (
          <p className="account-message account-message--error" role="alert">
            {action.error}
          </p>
        ) : null}
        {action?.success ? (
          <p className="account-message account-message--success" role="status">
            Your profile has been updated.
          </p>
        ) : null}

        <button
          className="account-button account-button--primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </Form>
    </section>
  );
}
