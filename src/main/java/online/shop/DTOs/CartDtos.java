package online.shop.DTOs;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CartDtos {
    public record CartItemDto(
            UUID id, UUID productId, String productName, String slug, String imageUrl,
            BigDecimal unitPrice, Integer quantity, String size, BigDecimal lineTotal,
            Integer stockQuantity
    ) {}

    public record CartDto(UUID id, List<CartItemDto> items, BigDecimal subtotal,
                          BigDecimal totalSavings, Integer totalItems) {}

    public record AddToCartRequest(
            @NotNull UUID productId,
            @NotNull @Min(1) Integer quantity,
            String size
    ) {}

    public record UpdateCartItemRequest(
            @NotNull @Min(1) Integer quantity,
            String size
    ) {}
}
