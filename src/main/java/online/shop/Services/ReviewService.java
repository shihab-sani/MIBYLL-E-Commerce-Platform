package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.ReviewDtos.*;
import online.shop.Entity.Product;
import online.shop.Entity.ProductReview;
import online.shop.Entity.User;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.ProductRepository;
import online.shop.Repositories.ProductReviewRepository;
import online.shop.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviews(UUID productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(r -> new ReviewDto(
                        r.getId(), r.getUser().getEmail(), r.getUser().getFullName(), r.getRating(),
                        r.getComment(), r.getImageUrls(), r.getAdminReply(), r.getCreatedAt()
                )).toList();
    }

    @Transactional
    public void addReview(String email, UUID productId, ReviewRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> ApiException.notFound("Product not found"));

        if (req.rating() < 1 || req.rating() > 5) throw ApiException.badRequest("Rating must be between 1 and 5");

        // REMOVED the check that prevented multiple reviews from the same user

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .rating(req.rating())
                .comment(req.comment())
                .imageUrls(req.imageUrls() != null ? req.imageUrls() : new java.util.ArrayList<>())
                .build();

        reviewRepository.save(review);
    }

    @Transactional
    public void updateReview(String email, UUID reviewId, ReviewRequest req) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ApiException.notFound("Review not found"));

        // SECURITY CHECK: Ensure the logged-in user is the owner of the review
        if (!review.getUser().getEmail().equalsIgnoreCase(email)) {
            throw ApiException.badRequest("Unauthorized: You can only edit your own reviews.");
        }

        if (req.rating() < 1 || req.rating() > 5) throw ApiException.badRequest("Rating must be between 1 and 5");

        review.setRating(req.rating());
        review.setComment(req.comment());
        review.setImageUrls(req.imageUrls() != null ? req.imageUrls() : new java.util.ArrayList<>());

        reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(String email, UUID reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ApiException.notFound("Review not found"));

        // SECURITY CHECK: Ensure the logged-in user is the owner of the review
        if (!review.getUser().getEmail().equalsIgnoreCase(email)) {
            throw ApiException.badRequest("Unauthorized: You can only delete your own reviews.");
        }

        reviewRepository.delete(review);
    }

    @Transactional(readOnly = false)
    public List<AdminReviewDto> getReviewsByUser(UUID userId) {
        List<ProductReview> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // Mark as seen
        boolean updated = false;
        for (ProductReview r : reviews) {
            if (!r.isSeenByAdmin()) {
                r.setSeenByAdmin(true);
                updated = true;
            }
        }
        if (updated) reviewRepository.saveAll(reviews);

        return reviews.stream()
                .map(r -> new AdminReviewDto(
                        r.getId(), r.getProduct().getId(), r.getProduct().getName(), r.getProduct().getSlug(),
                        r.getProduct().getImages().isEmpty() ? null : r.getProduct().getImages().get(0).getImageUrl(),
                        r.getRating(), r.getComment(), r.getImageUrls(), r.getAdminReply(), r.getCreatedAt()
                )).toList();
    }

    @Transactional
    public void replyToReview(UUID reviewId, String reply) {
        ProductReview review = reviewRepository.findById(reviewId).orElseThrow(() -> ApiException.notFound("Review not found"));
        review.setAdminReply(reply);
        review.setSeenByCustomer(false);
        reviewRepository.save(review);
    }

    @Transactional
    public void deleteAdminReply(UUID reviewId) {
        ProductReview review = reviewRepository.findById(reviewId).orElseThrow(() -> ApiException.notFound("Review not found"));
        review.setAdminReply(null);
        reviewRepository.save(review);
    }

    @Transactional
    public void deleteReviewByAdmin(UUID reviewId) {
        if (!reviewRepository.existsById(reviewId)) throw ApiException.notFound("Review not found");
        reviewRepository.deleteById(reviewId);
    }

    @Transactional(readOnly = true)
    public long countUnseenReviews() {
        return reviewRepository.countBySeenByAdminFalse();
    }

    @Transactional(readOnly = true)
    public List<CustomerReviewDto> getMyReviews(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(r -> new CustomerReviewDto(
                        r.getId(), r.getProduct().getId(), r.getProduct().getName(), r.getProduct().getSlug(),
                        r.getProduct().getImages().isEmpty() ? null : r.getProduct().getImages().get(0).getImageUrl(),
                        r.getRating(), r.getComment(), r.getImageUrls(), r.getAdminReply(), r.getCreatedAt()
                )).toList();
    }

    @Transactional(readOnly = true)
    public long countUnreadReplies(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return reviewRepository.countByUserIdAndAdminReplyIsNotNullAndSeenByCustomerFalse(user.getId());
    }

    @Transactional
    public void markRepliesAsSeen(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<ProductReview> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        boolean updated = false;
        for (ProductReview r : reviews) {
            if (!r.isSeenByCustomer() && r.getAdminReply() != null) {
                r.setSeenByCustomer(true);
                updated = true;
            }
        }
        if (updated) reviewRepository.saveAll(reviews);
    }
}
