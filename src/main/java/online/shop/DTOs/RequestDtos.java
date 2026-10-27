package online.shop.DTOs;

import java.time.LocalDateTime;
import java.util.UUID;

public class RequestDtos {
    public record RequestDto(
            UUID id, String customerName, String customerEmail,
            UUID productId, String productName, String productImage,
            String message, String status, String adminReply, LocalDateTime createdAt
    ) {}

    public record CreateRequestDto(
            UUID productId, String message
    ) {}

    // NEW DTO FOR UPDATING STATUS AND REPLY
    public record UpdateRequestDto(
            String status, String adminReply
    ) {}
}
