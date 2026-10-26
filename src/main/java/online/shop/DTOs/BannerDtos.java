package online.shop.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class BannerDtos {
    public record BannerMediaDto(
            Long id,
            String mediaUrl,
            String mediaType,
            Integer displayOrder
    ) {}

    public record BannerMediaRequest(
            String mediaUrl,
            String mediaType
    ) {}

    public record BannerDto(
            UUID id,
            String title,
            String subtitle,
            String ctaText,
            String ctaLink,
            String position,
            UUID linkedProductId,
            String linkedProductSlug,
            Integer displayOrder,
            boolean active,
            LocalDateTime createdAt,
            List<BannerMediaDto> mediaList
    ) {}

    public record BannerRequest(
            String title,
            String subtitle,
            String ctaText,
            String ctaLink,

            @NotBlank
            String position,

            UUID linkedProductId,
            Integer displayOrder,
            Boolean active,
            @NotEmpty List<BannerMediaRequest> mediaList
    ) {}
}
