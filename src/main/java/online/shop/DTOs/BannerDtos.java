package online.shop.DTOs;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.UUID;

public class BannerDtos {
    public record BannerDto(
            UUID id,
            String title,
            String subtitle,
            String ctaText,
            String ctaLink,
            String mediaUrl,
            String mediaType,
            String position,             // ← NEW
            UUID linkedProductId,
            String linkedProductSlug,
            Integer displayOrder,
            boolean active,
            LocalDateTime createdAt
    ) {}

    public record BannerRequest(
            String title,
            String subtitle,
            String ctaText,
            String ctaLink,
            @NotBlank String mediaUrl,
            @NotBlank String mediaType,
            String position,             // ← NEW
            UUID linkedProductId,
            Integer displayOrder,
            Boolean active
    ) {}
}
