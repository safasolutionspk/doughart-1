import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signCustomerToken } from "../middleware/customerAuth";
import { Customer } from "../models";
import { notifyCustomerPasswordReset } from "./email";
import { ApiError } from "../utils/ApiError";
import type {
  CustomerForgotPasswordInput,
  CustomerLoginInput,
  CustomerResetPasswordInput,
  CustomerSignupInput,
} from "../validators/customer.validator";

const BCRYPT_ROUNDS = 12;
const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_EXPIRY_MS = 30 * 60 * 1000;

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type PublicCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

function toPublicCustomer(customer: {
  _id: { toString(): string };
  name: string;
  email: string;
  phone: string;
}): PublicCustomer {
  return {
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  };
}

export async function signupCustomer(input: CustomerSignupInput) {
  const email = input.email.trim().toLowerCase();
  const existing = await Customer.findOne({ email }).lean();

  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const customer = await Customer.create({
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash,
    isActive: true,
  });

  const token = signCustomerToken({
    sub: customer._id.toString(),
    email: customer.email,
  });

  return {
    token,
    customer: toPublicCustomer(customer),
  };
}

export async function loginCustomer(input: CustomerLoginInput) {
  const email = input.email.trim().toLowerCase();
  const customer = await Customer.findOne({ email }).select(
    "+passwordHash",
  );

  if (!customer || !customer.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(input.password, customer.passwordHash);

  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signCustomerToken({
    sub: customer._id.toString(),
    email: customer.email,
  });

  return {
    token,
    customer: toPublicCustomer(customer),
  };
}

export async function getCustomerById(id: string): Promise<PublicCustomer> {
  const customer = await Customer.findById(id).select(
    "_id email name phone isActive",
  );

  if (!customer || !customer.isActive) {
    throw ApiError.unauthorized("Invalid or inactive customer account");
  }

  return toPublicCustomer(customer);
}

export async function requestPasswordReset(input: CustomerForgotPasswordInput) {
  const email = input.email.trim().toLowerCase();
  const customer = await Customer.findOne({ email, isActive: true }).select(
    "_id email",
  );

  if (customer) {
    const rawToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

    customer.passwordResetTokenHash = tokenHash;
    customer.passwordResetExpiresAt = expiresAt;
    await customer.save();

    notifyCustomerPasswordReset({
      customerEmail: customer.email,
      customerId: customer._id.toString(),
      token: rawToken,
      expiresMinutes: PASSWORD_RESET_EXPIRY_MS / (60 * 1000),
    });
  }

  return {
    requested: true,
  };
}

export async function resetPassword(input: CustomerResetPasswordInput) {
  const token = input.token.trim();
  if (!token) {
    throw ApiError.badRequest("Invalid or expired password reset token");
  }

  const tokenHash = hashResetToken(token);

  const customer = await Customer.findOne({
    isActive: true,
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordHash +passwordResetTokenHash +passwordResetExpiresAt");

  if (!customer) {
    throw ApiError.badRequest("Invalid or expired password reset token");
  }

  customer.passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  customer.passwordResetTokenHash = undefined;
  customer.passwordResetExpiresAt = undefined;
  await customer.save();

  return {
    passwordReset: true,
  };
}
