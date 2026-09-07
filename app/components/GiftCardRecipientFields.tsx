import {useId} from 'react';

export type GiftCardRecipientDetails = {
  delivery: 'self' | 'recipient';
  email: string;
  message: string;
  name: string;
  sendOn: string;
};

export const EMPTY_GIFT_CARD_RECIPIENT: GiftCardRecipientDetails = {
  delivery: 'self',
  email: '',
  message: '',
  name: '',
  sendOn: '',
};

export function GiftCardRecipientFields({
  details,
  onChange,
}: {
  details: GiftCardRecipientDetails;
  onChange: (details: GiftCardRecipientDetails) => void;
}) {
  const id = useId();
  const today = new Date().toISOString().slice(0, 10);
  const maximumDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const isRecipient = details.delivery === 'recipient';
  const hasInvalidEmail =
    isRecipient && !/^\S+@\S+\.\S+$/.test(details.email.trim());

  function update(
    field: keyof GiftCardRecipientDetails,
    value: GiftCardRecipientDetails[keyof GiftCardRecipientDetails],
  ) {
    onChange({...details, [field]: value});
  }

  return (
    <section className="gift-card-recipient" aria-labelledby={`${id}-title`}>
      <fieldset>
        <legend id={`${id}-title`}>Send gift card to</legend>
        <div className="gift-card-recipient__choices">
          <label>
            <input
              checked={!isRecipient}
              name={`${id}-delivery`}
              onChange={() => update('delivery', 'self')}
              type="radio"
              value="self"
            />
            <span>My email</span>
          </label>
          <label>
            <input
              aria-controls={`${id}-fields`}
              checked={isRecipient}
              name={`${id}-delivery`}
              onChange={() => update('delivery', 'recipient')}
              type="radio"
              value="recipient"
            />
            <span>Someone else</span>
          </label>
        </div>
      </fieldset>

      {isRecipient ? (
        <div className="gift-card-recipient__fields" id={`${id}-fields`}>
          <label htmlFor={`${id}-email`}>
            Recipient email <span aria-hidden="true">*</span>
          </label>
          <input
            aria-describedby={hasInvalidEmail ? `${id}-email-error` : undefined}
            aria-invalid={hasInvalidEmail || undefined}
            autoComplete="email"
            id={`${id}-email`}
            onChange={(event) => update('email', event.currentTarget.value)}
            required
            type="email"
            value={details.email}
          />
          {hasInvalidEmail ? (
            <p className="gift-card-recipient__error" id={`${id}-email-error`}>
              Enter a valid recipient email to continue.
            </p>
          ) : null}

          <label htmlFor={`${id}-name`}>Recipient name (optional)</label>
          <input
            autoComplete="name"
            id={`${id}-name`}
            maxLength={100}
            onChange={(event) => update('name', event.currentTarget.value)}
            type="text"
            value={details.name}
          />

          <label htmlFor={`${id}-message`}>Message (optional)</label>
          <textarea
            aria-describedby={`${id}-message-count`}
            id={`${id}-message`}
            maxLength={200}
            onChange={(event) => update('message', event.currentTarget.value)}
            rows={4}
            value={details.message}
          />
          <p id={`${id}-message-count`}>
            {details.message.length} of 200 characters
          </p>

          <label htmlFor={`${id}-send-on`}>Send on (optional)</label>
          <input
            id={`${id}-send-on`}
            max={maximumDate}
            min={today}
            onChange={(event) => update('sendOn', event.currentTarget.value)}
            type="date"
            value={details.sendOn}
          />
        </div>
      ) : null}
    </section>
  );
}
