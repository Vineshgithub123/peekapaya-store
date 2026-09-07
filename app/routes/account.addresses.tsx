import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {useId, type ComponentProps} from 'react';
import {
  data,
  Form,
  redirect,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {isCustomerAccountConfigured} from '~/lib/customerAccount';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  error: Record<AddressFragment['id'], string> | string | null;
  success?: 'created' | 'updated' | 'deleted';
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Addresses'}];
};

export async function loader({context}: Route.LoaderArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect('/account');
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // Return an action error instead of redirecting an expired form submission.
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            addressId,
            error: null,
            success: 'created' as const,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: 'Address creation failed.'}},
            {status: 400},
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            addressId,
            error: null,
            success: 'updated' as const,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: 'Address update failed.'}},
            {status: 400},
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {addressId, error: null, success: 'deleted' as const};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: 'Address deletion failed.'}},
            {status: 400},
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data({error: 'Address request failed.'}, {status: 400});
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const action = useActionData<ActionResponse>();
  const {defaultAddress, addresses} = customer;
  const successMessage = action?.success
    ? {
        created: 'Your address has been added.',
        updated: 'Your address has been updated.',
        deleted: 'Your address has been removed.',
      }[action.success]
    : null;

  return (
    <section aria-labelledby="addresses-heading" className="account-section">
      <div className="account-section__heading">
        <h2 id="addresses-heading">Addresses</h2>
        <p>Manage the delivery addresses saved to your account.</p>
      </div>

      {successMessage ? (
        <p className="account-message account-message--success" role="status">
          {successMessage}
        </p>
      ) : null}

      <div className="account-address-card account-address-card--new">
        <h3>Add a new address</h3>
        <NewAddressForm key={addresses.nodes.length} />
      </div>

      <div className="account-addresses__saved">
        <h3>Saved addresses</h3>
        {!addresses.nodes.length ? (
          <div className="account-empty-state">
            <p>You have no saved addresses.</p>
          </div>
        ) : (
          <ExistingAddresses
            addresses={addresses}
            defaultAddress={defaultAddress}
          />
        )}
      </div>
    </section>
  );
}

function NewAddressForm() {
  const newAddress: CustomerAddressInput = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  return (
    <AddressForm
      addressId="NEW_ADDRESS_ID"
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => {
        const isCreating = stateForMethod('POST') !== 'idle';
        return (
          <button
            className="account-button account-button--primary"
            disabled={isCreating}
            formMethod="POST"
            type="submit"
          >
            {isCreating ? 'Adding address…' : 'Add address'}
          </button>
        );
      }}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div className="account-address-grid">
      {addresses.nodes.map((address) => (
        <div className="account-address-card" key={address.id}>
          <AddressForm
            addressId={address.id}
            address={address}
            defaultAddress={defaultAddress}
          >
            {({stateForMethod}) => {
              const isSaving = stateForMethod('PUT') !== 'idle';
              const isDeleting = stateForMethod('DELETE') !== 'idle';
              return (
                <div className="account-form__actions">
                  <button
                    className="account-button account-button--primary"
                    disabled={isSaving || isDeleting}
                    formMethod="PUT"
                    type="submit"
                  >
                    {isSaving ? 'Saving…' : 'Save address'}
                  </button>
                  <button
                    className="account-button account-button--danger"
                    disabled={isSaving || isDeleting}
                    formMethod="DELETE"
                    onClick={(event) => {
                      if (!window.confirm('Remove this saved address?')) {
                        event.preventDefault();
                      }
                    }}
                    type="submit"
                  >
                    {isDeleting ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              );
            }}
          </AddressForm>
        </div>
      ))}
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const generatedId = useId().replaceAll(':', '');
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error =
    typeof action?.error === 'object' && action.error
      ? action.error[addressId]
      : action?.error;
  const isDefaultAddress = defaultAddress?.id === addressId;
  const addressName = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <Form className="account-form account-address-form" id={generatedId}>
      <fieldset>
        <legend>
          {addressId === 'NEW_ADDRESS_ID'
            ? 'Address details'
            : addressName || 'Saved address'}
          {isDefaultAddress ? (
            <span className="account-address-form__default">Default</span>
          ) : null}
        </legend>
        <input type="hidden" name="addressId" value={addressId} />
        <div className="account-form__grid">
          <AddressInput
            autoComplete="given-name"
            formId={generatedId}
            label="First name"
            name="firstName"
            required
            initialValue={address.firstName}
          />
          <AddressInput
            autoComplete="family-name"
            formId={generatedId}
            label="Last name"
            name="lastName"
            required
            initialValue={address.lastName}
          />
          <AddressInput
            autoComplete="organization"
            formId={generatedId}
            label="Company"
            name="company"
            initialValue={address.company}
          />
          <AddressInput
            autoComplete="address-line1"
            formId={generatedId}
            label="Address line 1"
            name="address1"
            required
            initialValue={address.address1}
          />
          <AddressInput
            autoComplete="address-line2"
            formId={generatedId}
            label="Address line 2"
            name="address2"
            initialValue={address.address2}
          />
          <AddressInput
            autoComplete="address-level2"
            formId={generatedId}
            label="City"
            name="city"
            required
            initialValue={address.city}
          />
          <AddressInput
            autoComplete="address-level1"
            formId={generatedId}
            label="State / Province"
            name="zoneCode"
            required
            initialValue={address.zoneCode}
          />
          <AddressInput
            autoComplete="postal-code"
            formId={generatedId}
            label="Zip / Postal code"
            name="zip"
            required
            initialValue={address.zip}
          />
          <AddressInput
            autoComplete="country"
            formId={generatedId}
            label="Country code"
            maxLength={2}
            name="territoryCode"
            required
            initialValue={address.territoryCode}
          />
          <AddressInput
            autoComplete="tel"
            formId={generatedId}
            label="Phone"
            name="phoneNumber"
            pattern="^\+?[1-9]\d{3,14}$"
            placeholder="+16135551111"
            type="tel"
            initialValue={address.phoneNumber}
          />
        </div>

        <div className="account-checkbox">
          <input
            defaultChecked={isDefaultAddress}
            id={`${generatedId}-default`}
            name="defaultAddress"
            type="checkbox"
          />
          <label htmlFor={`${generatedId}-default`}>
            Set as default address
          </label>
        </div>

        {error ? (
          <p className="account-message account-message--error" role="alert">
            {error}
          </p>
        ) : null}

        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </fieldset>
    </Form>
  );
}

type AddressInputProps = Omit<
  ComponentProps<'input'>,
  'defaultValue' | 'id' | 'name' | 'value'
> & {
  formId: string;
  initialValue?: string | null;
  label: string;
  name: keyof CustomerAddressInput;
};

function AddressInput({
  formId,
  initialValue,
  label,
  name,
  required,
  type = 'text',
  ...inputProps
}: AddressInputProps) {
  const inputId = `${formId}-${name}`;

  return (
    <div className="account-field">
      <label htmlFor={inputId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        {...inputProps}
        defaultValue={initialValue ?? ''}
        id={inputId}
        name={name}
        required={required}
        type={type}
      />
    </div>
  );
}
