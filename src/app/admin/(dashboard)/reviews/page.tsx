import { getReviews } from "@/services/reviews.service";
import { ReviewsManager } from "@/components/admin/reviews-manager";

export default async function ReviewsAdminPage() {
  const reviews = await getReviews();
  return <ReviewsManager initialReviews={reviews} />;
}
