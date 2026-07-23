export const reviewsCopy = {
  subtitle: "Sweet words from customers who celebrated with DoughArt.",
  heading: "Loved by Our Customers",
} as const;

export type StaticReview = {
  id: string;
  name: string;
  role?: string;
  initials: string;
  avatar?: string;
  text: string;
  rating: number;
};

export type PublicReview = {
  _id: string;
  name: string;
  role?: string;
  rating: number;
  text: string;
  image?: string;
  sortOrder: number;
};

export type DisplayReview = {
  id: string;
  name: string;
  role?: string;
  initials: string;
  avatar?: string;
  text: string;
  rating: number;
};

export const customerReviews: StaticReview[] = [
  {
    id: "review-1",
    name: "Ayesha K.",
    initials: "AK",
    text: "The cake looked beautiful and tasted fresh. The design matched what I requested perfectly.",
    rating: 5,
  },
  {
    id: "review-2",
    name: "Hira M.",
    initials: "HM",
    text: "Ordering was simple, and the cake arrived on time for our family celebration.",
    rating: 5,
  },
  {
    id: "review-3",
    name: "Sana A.",
    initials: "SA",
    text: "The finishing was neat, the flavour was balanced, and everyone enjoyed it.",
    rating: 5,
  },
  {
    id: "review-4",
    name: "Maryam R.",
    initials: "MR",
    text: "DoughArt turned our idea into a lovely custom cake that felt made for our moment.",
    rating: 5,
  },
  {
    id: "review-5",
    name: "Zainab F.",
    initials: "ZF",
    text: "Every detail was handled carefully, and the final cake looked elegant and well presented.",
    rating: 5,
  },
  {
    id: "review-6",
    name: "Mahnoor S.",
    initials: "MS",
    text: "Fresh, beautifully decorated, and packed with care. The whole experience felt smooth.",
    rating: 5,
  },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function toDisplayReview(review: PublicReview): DisplayReview {
  return {
    id: review._id,
    name: review.name,
    role: review.role,
    initials: getInitials(review.name),
    avatar: review.image,
    text: review.text,
    rating: review.rating,
  };
}

export function staticToDisplayReview(review: StaticReview): DisplayReview {
  return {
    id: review.id,
    name: review.name,
    role: review.role,
    initials: review.initials,
    avatar: review.avatar,
    text: review.text,
    rating: review.rating,
  };
}

export async function fetchPublicReviews(): Promise<PublicReview[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/public`, {
      next: { revalidate: 60 },
    });

    const body = (await response.json()) as {
      success: boolean;
      data?: PublicReview[];
    };

    if (!response.ok || !body.success || !body.data?.length) {
      return [];
    }

    return body.data;
  } catch {
    return [];
  }
}

export async function getDisplayReviews(limit = 6): Promise<DisplayReview[]> {
  const all = await getAllDisplayReviews();
  return all.slice(0, limit);
}

/** Homepage carousel uses curated static demos so old API/demo names are never shown. */
export function getHomepageDisplayReviews(): DisplayReview[] {
  return customerReviews.map(staticToDisplayReview);
}

export async function getAllDisplayReviews(): Promise<DisplayReview[]> {
  const apiReviews = await fetchPublicReviews();
  if (apiReviews.length > 0) {
    return apiReviews.map(toDisplayReview);
  }

  return customerReviews.map(staticToDisplayReview);
}
