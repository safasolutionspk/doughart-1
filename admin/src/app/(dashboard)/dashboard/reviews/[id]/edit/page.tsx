import { ReviewForm } from "@/components/reviews/ReviewForm";

type EditReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { id } = await params;
  return <ReviewForm reviewId={id} />;
}
