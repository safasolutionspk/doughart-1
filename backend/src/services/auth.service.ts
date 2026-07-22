import bcrypt from "bcryptjs";
import { Admin } from "../models";
import { signAdminToken } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import type { LoginInput } from "../validators/auth.validator";

export async function loginAdmin(input: LoginInput) {
  const admin = await Admin.findOne({ email: input.email.toLowerCase() }).select(
    "+password",
  );

  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(input.password, admin.password);

  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signAdminToken({
    sub: admin._id.toString(),
    email: admin.email,
    role: admin.role,
  });

  return {
    token,
    admin: {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  };
}
