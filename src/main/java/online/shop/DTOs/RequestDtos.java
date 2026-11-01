package online.shop.DTOs;

import online.shop.Entity.RequestMessage;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RequestDtos {
    public record RequestDto(
            UUID id, String customerName, String customerEmail,
            UUID productId, String productName, String productImage,
            String size, String variantName, String status,
            List<MessageDto> messages, boolean hasUnreadCustomer, boolean hasUnreadAdmin,
            LocalDateTime createdAt
    ) {}

    public record MessageDto(UUID id, String senderRole, String message, LocalDateTime createdAt) {}

    public record CreateRequestDto(UUID productId, String message, String size, String variantName) {}

    public record ReplyRequestDto(String message) {}

    // NEW DTO FOR UPDATING STATUS AND REPLY
    public record UpdateRequestDto(
            String status
    ) {}
}
