package online.shop.DTOs;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ProductDtos {
    public record ProductDto(
            UUID id, String name, String slug, String description,
            BigDecimal price, Integer discountPercent, BigDecimal finalPrice,
            Integer stockQuantity, String brand,
            boolean featured, boolean newArrival, boolean active,
            UUID categoryId, String categoryName, List<String> images, LocalDateTime createdAt
    ) {}

    public record ProductRequest(
            @NotBlank String name,
            String slug,
            String description,
            @NotNull @DecimalMin("0.0") BigDecimal price,
            @Min(0) @Max(90) Integer discountPercent,
            @NotNull @Min(0) Integer stockQuantity,
            String brand,
            boolean featured,
            boolean newArrival,          // <-- NEW (position matters!)
            Boolean active,
            UUID categoryId,
            List<String> images
    ) {}

    public record StockUpdateRequest(@NotNull @Min(0) Integer stockQuantity) {}

    public record DiscountUpdateRequest(@NotNull @Min(0) @Max(90) Integer discountPercent) {}

    public record PriceUpdateRequest(@NotNull @DecimalMin("0.0") BigDecimal price) {}

}
