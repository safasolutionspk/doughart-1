import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { Admin, BusinessSettings, Review } from "../models";

export async function seedAdmin(): Promise<void> {
  const existing = await Admin.findOne({ email: env.ADMIN_EMAIL });

  if (existing) {
    console.log("Admin already exists, skipping seed");
    return;
  }

  const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  await Admin.create({
    email: env.ADMIN_EMAIL,
    password: hashedPassword,
    name: env.ADMIN_NAME,
    role: "super_admin",
    isActive: true,
  });

  console.log(`Admin seeded: ${env.ADMIN_EMAIL}`);
}

export async function seedBusinessSettings(): Promise<void> {
  const existing = await BusinessSettings.findOne();

  if (existing) {
    return;
  }

  await BusinessSettings.create({
    businessName: "DoughArt",
    tagline: "Custom Cakes",
    email: "Sweetbitelahore@gmail.com",
    phone: "03046736831",
    address: "Main Market Gulberg 2 Lahore",
    deliveryInfo:
      "We deliver across the local area. Order at least 48 hours ahead for custom cakes.",
    facebook: "https://www.facebook.com/sweetbitelahore",
    instagram: "https://www.instagram.com/sweetbitelahore/",
    tiktok: "https://www.tiktok.com/@sweetbitelahore",
    whatsapp: "923046736831",
    bankName: "HBL",
    bankAccountTitle: "DoughArt",
    bankAccountNumber: "12345678901234",
    bankPaymentInstructions:
      "Transfer the order total and use your order number as the payment reference. Upload your receipt on My Order after paying.",
  });

  console.log("Default business settings seeded");
}

const defaultReviews = [
  {
    name: "Sarah Mitchell",
    role: "Bride",
    rating: 5,
    text: "Our wedding cake was absolutely stunning — guests are still talking about it weeks later. DoughArt made our vision come true.",
    sortOrder: 0,
  },
  {
    name: "James & Priya K.",
    role: "Parents",
    rating: 5,
    text: "Ordered a custom birthday cake for our daughter and it exceeded every expectation. Beautiful design and incredible taste.",
    sortOrder: 1,
  },
  {
    name: "Emily Rodriguez",
    role: "Customer",
    rating: 5,
    text: "Professional, friendly, and on time. The anniversary cake was elegant, delicious, and packaged with such care. Highly recommend!",
    sortOrder: 2,
  },
  {
    name: "David Chen",
    role: "Event Planner",
    rating: 5,
    text: "DoughArt is my go-to for client celebrations. Consistent quality, gorgeous presentation, and always delivered on schedule.",
    sortOrder: 3,
  },
] as const;

export async function seedReviews(): Promise<void> {
  const existing = await Review.findOne();

  if (existing) {
    console.log("Reviews already exist, skipping seed");
    return;
  }

  await Review.insertMany(
    defaultReviews.map((review) => ({
      ...review,
      isActive: true,
    })),
  );

  console.log(`Seeded ${defaultReviews.length} default reviews`);
}

export async function runSeed(): Promise<void> {
  await seedAdmin();
  await seedBusinessSettings();
  await seedReviews();
}
