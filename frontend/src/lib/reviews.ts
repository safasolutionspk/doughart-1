export const reviewsCopy = {
  subtitle: "Our Happy Customers",
  heading: "Loved By Hundreds Of Happy Customers",
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
    name: "Sarah Mitchell",
    role: "Bride",
    initials: "SM",
    avatar: "/images/real/review-1.jpg",
    text: "Our wedding cake was absolutely stunning — guests are still talking about it weeks later. DoughArt made our vision come true.",
    rating: 5,
  },
  {
    id: "review-2",
    name: "James & Priya K.",
    role: "Parents",
    initials: "JP",
    avatar: "/images/real/review-2.jpg",
    text: "Ordered a custom birthday cake for our daughter and it exceeded every expectation. Beautiful design and incredible taste.",
    rating: 5,
  },
  {
    id: "review-3",
    name: "Emily Rodriguez",
    role: "Customer",
    initials: "ER",
    avatar: "/images/real/review-3.jpg",
    text: "Professional, friendly, and on time. The anniversary cake was elegant, delicious, and packaged with such care. Highly recommend!",
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

export async function getDisplayReviews(limit = 3): Promise<DisplayReview[]> {
  const all = await getAllDisplayReviews();
  return all.slice(0, limit);
}

export async function getAllDisplayReviews(): Promise<DisplayReview[]> {
  const apiReviews = await fetchPublicReviews();
  if (apiReviews.length > 0) {
    return apiReviews.map(toDisplayReview);
  }

  return customerReviews.map(staticToDisplayReview);
}
