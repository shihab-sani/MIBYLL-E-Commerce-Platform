package online.shop.DTOs;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ReviewDtos {
    public record ReviewDto(
            UUID id, String userEmail, String userName, Integer rating, String comment,
            List<String> imageUrls, String adminReply, LocalDateTime createdAt
    ) {}

    public record ReviewRequest(
            Integer rating, String comment, List<String> imageUrls
    ) {}

    public record AdminReviewDto(
            UUID id, UUID productId, String productName, String productSlug, String productImage,
            Integer rating, String comment, List<String> imageUrls, String adminReply, LocalDateTime createdAt
    ) {}

    public record CustomerReviewDto(
            UUID id, UUID productId, String productName, String productSlug, String productImage,
            Integer rating, String comment, List<String> imageUrls, String adminReply, LocalDateTime createdAt
    ) {}

    public record AdminReplyRequest(String reply) {}
}
