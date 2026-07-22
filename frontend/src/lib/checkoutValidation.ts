export type CheckoutFormValues = {
  name: string;
  phone: string;
  email: string;
  deliveryDate: string;
  address: string;
  size: string;
  flavor: string;
  message: string;
  notes: string;
};

export type CheckoutFieldErrors = Partial<
  Record<keyof CheckoutFormValues, string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s+().-]{7,30}$/;

function isFutureOrToday(dateValue: string): boolean {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function validateCheckoutForm(
  values: CheckoutFormValues,
): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const name = values.name.trim();

  if (name.length < 2) {
    errors.name = "Please enter your name.";
  } else if (name.length > 120) {
    errors.name = "Name is too long (maximum 120 characters).";
  }

  const phone = values.phone.trim();
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else if (phone.length < 7) {
    errors.phone = "Please enter your phone number.";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = "Phone number contains invalid characters.";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "Email is required so we can confirm your order.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.deliveryDate && !isFutureOrToday(values.deliveryDate)) {
    errors.deliveryDate = "Delivery date must be today or in the future.";
  }

  if (!values.address.trim()) {
    errors.address = "Please enter your address.";
  } else if (values.address.trim().length > 500) {
    errors.address = "Address is too long (maximum 500 characters).";
  }

  if (!values.size.trim()) {
    errors.size = "Please enter cake pounds.";
  } else if (values.size.trim().length > 80) {
    errors.size = "Pounds is too long (maximum 80 characters).";
  }

  if (!values.flavor.trim()) {
    errors.flavor = "Please enter cake flavor.";
  } else if (values.flavor.trim().length > 120) {
    errors.flavor = "Flavor is too long (maximum 120 characters).";
  }

  if (values.message.trim().length > 200) {
    errors.message = "Message on cake is too long (maximum 200 characters).";
  }

  if (values.notes.trim().length > 1000) {
    errors.notes = "Notes are too long (maximum 1000 characters).";
  }

  return errors;
}

export function hasCheckoutErrors(errors: CheckoutFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Map backend Zod field names to checkout form fields */
export function mapApiFieldErrors(
  errors?: Record<string, string[] | undefined>,
): CheckoutFieldErrors {
  if (!errors) {
    return {};
  }

  const mapped: CheckoutFieldErrors = {};
  const fieldMap: Record<string, keyof CheckoutFormValues> = {
    name: "name",
    phone: "phone",
    email: "email",
    deliveryDate: "deliveryDate",
    address: "address",
    size: "size",
    flavor: "flavor",
    message: "message",
    notes: "notes",
  };

  for (const [key, messages] of Object.entries(errors)) {
    const formKey = fieldMap[key];
    const message = messages?.[0];
    if (formKey && message) {
      mapped[formKey] = message;
    }
  }

  return mapped;
}

export function getFirstCheckoutError(
  errors: CheckoutFieldErrors,
): string | null {
  const first = Object.values(errors).find(Boolean);
  return first ?? null;
}
