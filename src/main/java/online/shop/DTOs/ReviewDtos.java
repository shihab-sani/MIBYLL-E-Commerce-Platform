package online.shop.DTOs;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ReviewDtos {
    public record ReviewDto(
            UUID id, String userEmail, String userName, Integer rating, String comment,
            List<String> imageUrls, LocalDateTime createdAt
    ) {}

    public record ReviewRequest(
            Integer rating, String comment, List<String> imageUrls
    ) {}
}
