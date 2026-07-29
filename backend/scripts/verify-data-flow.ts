/**
 * Phase 3 data-flow verification (run with backend on localhost:5000).
 * Usage: MONGODB_URI=mongodb://127.0.0.1:27017/doughart npx tsx scripts/verify-data-flow.ts
 */
import fs from "fs/promises";
import path from "path";

const API = process.env.API_BASE ?? "http://localhost:5000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-strong-password";

type ApiOk<T> = { success: true; data: T; message?: string };
type ApiFail = { success: false; message: string };

let passed = 0;
let failed = 0;

function ok(name: string) {
  passed += 1;
  console.log(`✓ ${name}`);
}

function fail(name: string, detail: string) {
  failed += 1;
  console.error(`✗ ${name}: ${detail}`);
}

async function apiJson<T>(
  route: string,
  init?: RequestInit,
): Promise<{ status: number; body: ApiOk<T> | ApiFail }> {
  const response = await fetch(`${API}${route}`, init);
  const body = (await response.json()) as ApiOk<T> | ApiFail;
  return { status: response.status, body };
}

async function loginAdmin(): Promise<string> {
  const { status, body } = await apiJson<{ token: string }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (status !== 200 || !body.success || !("data" in body) || !body.data.token) {
    throw new Error(
      !body.success ? body.message : `Login failed HTTP ${status}`,
    );
  }
  return body.data.token;
}

/** Minimal valid JPEG bytes */
function tinyJpegBuffer(): Buffer {
  return Buffer.from(
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A0f/Z",
    "base64",
  );
}

async function main() {
  console.log(`Verifying data flow against ${API}\n`);

  const health = await apiJson<{ status: string; database: string }>("/api/health");
  if (health.status === 200 && health.body.success) {
    ok("Health check");
  } else {
    fail("Health check", `HTTP ${health.status}`);
    process.exit(1);
  }

  let token: string;
  try {
    token = await loginAdmin();
    ok("Admin login");
  } catch (e) {
    fail("Admin login", e instanceof Error ? e.message : String(e));
    process.exit(1);
  }

  const auth = { Authorization: `Bearer ${token}` };

  const formData = new FormData();
  const blob = new Blob([tinyJpegBuffer()], { type: "image/jpeg" });
  formData.append("image", blob, "verify-flow.jpg");

  const uploadRes = await fetch(`${API}/api/uploads/image`, {
    method: "POST",
    headers: auth,
    body: formData,
  });
  const uploadBody = (await uploadRes.json()) as ApiOk<{
    path: string;
    url: string;
    filename: string;
  }>;

  let imagePath = "";
  if (
    uploadRes.status === 201 &&
    uploadBody.success &&
    uploadBody.data.path?.startsWith("/uploads/images/")
  ) {
    imagePath = uploadBody.data.path;
    ok("Admin image upload returns /uploads/images path");
  } else {
    fail(
      "Admin image upload",
      !uploadBody.success ? uploadBody.message : `HTTP ${uploadRes.status}`,
    );
  }

  const slug = `verify-cat-${Date.now()}`;
  const catCreate = await apiJson<{ _id: string; slug: string; image?: string }>(
    "/api/categories",
    {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Verify Category",
        slug,
        description: "Phase 3 test category",
        image: imagePath || undefined,
        isActive: true,
        sortOrder: 99,
      }),
    },
  );

  let categoryId = "";
  if (
    catCreate.status === 201 &&
    catCreate.body.success &&
    catCreate.body.data.image === imagePath
  ) {
    categoryId = catCreate.body.data._id;
    ok("Category created with image path in MongoDB");
  } else if (catCreate.body.success && catCreate.status === 201) {
    categoryId = catCreate.body.data._id;
    fail(
      "Category image path",
      `expected ${imagePath}, got ${catCreate.body.data.image ?? "none"}`,
    );
  } else {
    fail(
      "Category create",
      !catCreate.body.success ? catCreate.body.message : `HTTP ${catCreate.status}`,
    );
  }

  const pubCats = await apiJson<
    Array<{ slug: string; image?: string; name: string }>
  >("/api/categories/public");
  const pubCat = pubCats.body.success
    ? pubCats.body.data.find((c) => c.slug === slug)
    : undefined;
  if (pubCats.status === 200 && pubCat?.image === imagePath) {
    ok("Public categories API returns same image path (frontend homepage)");
  } else {
    fail(
      "Public categories image",
      pubCat ? `got ${pubCat.image}` : "category not in public list",
    );
  }

  if (imagePath) {
    const imgRes = await fetch(`${API}${imagePath}`);
    if (imgRes.ok && (imgRes.headers.get("content-type") ?? "").includes("image")) {
      ok("Uploaded image served at /uploads/images");
    } else {
      fail("Image serve", `HTTP ${imgRes.status}`);
    }
  }

  const cakeSlug = `verify-cake-${Date.now()}`;
  const cakeCreate = await apiJson<{ _id: string; slug: string; image?: string }>(
    "/api/cakes",
    {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Verify Cake",
        slug: cakeSlug,
        categoryId,
        description: "Phase 3 test cake",
        price: 42,
        image: imagePath || undefined,
        isActive: true,
        isFeatured: false,
        isCustomizable: false,
        sortOrder: 1,
      }),
    },
  );

  if (
    cakeCreate.status === 201 &&
    cakeCreate.body.success &&
    cakeCreate.body.data.image === imagePath
  ) {
    ok("Cake created with image path");
  } else if (cakeCreate.body.success && cakeCreate.status === 201) {
    fail(
      "Cake image path",
      `expected ${imagePath}, got ${cakeCreate.body.data.image ?? "none"}`,
    );
  } else {
    fail(
      "Cake create",
      !cakeCreate.body.success ? cakeCreate.body.message : `HTTP ${cakeCreate.status}`,
    );
  }

  const pubCake = await apiJson<{ slug: string; image?: string }>(
    `/api/cakes/public/${cakeSlug}`,
  );
  if (pubCake.status === 200 && pubCake.body.success && pubCake.body.data.image === imagePath) {
    ok("Public cake by slug returns same image (frontend detail/listing)");
  } else {
    fail(
      "Public cake image",
      !pubCake.body.success
        ? pubCake.body.message
        : `HTTP ${pubCake.status} image=${pubCake.body.success ? pubCake.body.data.image : "n/a"}`,
    );
  }

  const reviewCreate = await apiJson<{ _id: string }>("/api/reviews", {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Verify Reviewer",
      role: "Tester",
      rating: 5,
      text: "Phase 3 review visibility test.",
      isActive: true,
      sortOrder: 0,
    }),
  });

  let reviewId = "";
  if (reviewCreate.status === 201 && reviewCreate.body.success) {
    reviewId = reviewCreate.body.data._id;
    ok("Review created in admin");
  } else {
    fail(
      "Review create",
      !reviewCreate.body.success ? reviewCreate.body.message : `HTTP ${reviewCreate.status}`,
    );
  }

  const pubReviews = await apiJson<
    Array<{ _id: string; name: string; text: string }>
  >("/api/reviews/public");
  const foundReview = pubReviews.body.success
    ? pubReviews.body.data.some((r) => r._id === reviewId)
    : false;
  if (pubReviews.status === 200 && foundReview) {
    ok("Public reviews API includes admin review (frontend)");
  } else {
    fail("Public reviews", foundReview ? "HTTP ok but missing review" : `HTTP ${pubReviews.status}`);
  }

  const testWhatsApp = "923277707333";
  const settingsPatch = await apiJson<{ whatsapp?: string }>("/api/settings", {
    method: "PATCH",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ whatsapp: testWhatsApp }),
  });
  if (settingsPatch.status === 200 && settingsPatch.body.success) {
    ok("Settings updated (whatsapp)");
  } else {
    fail(
      "Settings patch",
      !settingsPatch.body.success ? settingsPatch.body.message : `HTTP ${settingsPatch.status}`,
    );
  }

  const pubSettings = await apiJson<{ whatsapp?: string }>("/api/settings");
  if (
    pubSettings.status === 200 &&
    pubSettings.body.success &&
    pubSettings.body.data.whatsapp === testWhatsApp
  ) {
    ok("Public settings returns whatsapp (frontend WhatsApp)");
  } else {
    fail(
      "Public settings whatsapp",
      pubSettings.body.success
        ? `got ${pubSettings.body.data.whatsapp}`
        : pubSettings.body.message,
    );
  }

  const orderPayload = {
    name: "Verify Customer",
    email: "verify@example.com",
    phone: "03046736831",
    cakeType: "Verify Cake Order",
    // Public checkout is COD-only; any other value is rejected with 400.
    paymentMethod: "cash_on_delivery",
  };

  const orderCreate = await apiJson<{ orderNumber: string }>("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

  let orderNumber = "";
  if (orderCreate.status === 201 && orderCreate.body.success) {
    orderNumber = orderCreate.body.data.orderNumber;
    ok("Frontend order created via public API");
  } else {
    fail(
      "Order create",
      !orderCreate.body.success ? orderCreate.body.message : `HTTP ${orderCreate.status}`,
    );
  }

  const adminOrders = await apiJson<Array<{ orderNumber: string }>>(
    `/api/orders?search=${encodeURIComponent(orderNumber)}`,
    { headers: auth },
  );

  const orderInAdmin = adminOrders.body.success
    ? adminOrders.body.data.some((o) => o.orderNumber === orderNumber)
    : false;
  if (adminOrders.status === 200 && orderInAdmin) {
    ok("Order appears in admin list");
  } else {
    fail("Admin orders", orderInAdmin ? "search miss" : `HTTP ${adminOrders.status}`);
  }

  // COD-only enforcement: a non-COD payment method must be rejected with 400
  // before any database write.
  const rejectedOrder = await apiJson<{ orderNumber: string }>("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...orderPayload, paymentMethod: "bank_transfer" }),
  });
  if (rejectedOrder.status === 400 && !rejectedOrder.body.success) {
    ok("Non-COD payment method rejected (400)");
  } else {
    fail(
      "Non-COD rejection",
      `expected HTTP 400, got HTTP ${rejectedOrder.status}`,
    );
  }

  // Public reference-image upload (custom cake design images) still works.
  const referenceForm = new FormData();
  const referenceBlob = new Blob([tinyJpegBuffer()], { type: "image/jpeg" });
  referenceForm.append("image", referenceBlob, "reference.jpg");

  const referenceUpload = await fetch(
    `${API}/api/uploads/public/reference-image`,
    {
      method: "POST",
      body: referenceForm,
    },
  );
  const referenceBody = (await referenceUpload.json()) as ApiOk<{
    path: string;
    url: string;
  }>;

  if (
    referenceUpload.status === 201 &&
    referenceBody.success &&
    referenceBody.data.path?.startsWith("/uploads/images/")
  ) {
    ok("Reference image upload");
  } else {
    fail(
      "Reference image upload",
      !referenceBody.success ? referenceBody.message : `HTTP ${referenceUpload.status}`,
    );
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
