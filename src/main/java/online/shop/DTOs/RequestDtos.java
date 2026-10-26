package online.shop.DTOs;

import java.time.LocalDateTime;
import java.util.UUID;

public class RequestDtos {
    public record RequestDto(
            UUID id, String customerName, String customerEmail,
            UUID productId, String productName, String productImage,
            String message, String status, LocalDateTime createdAt
    ) {}

    public record CreateRequestDto(
            UUID productId, String message
    ) {}
}
