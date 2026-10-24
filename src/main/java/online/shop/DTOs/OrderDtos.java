package online.shop.DTOs;

import jakarta.validation.constraints.NotBlank;
import online.shop.Entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDtos {
    public record OrderItemDto(
            UUID id, UUID productId, String productName, String imageUrl,
            BigDecimal unitPrice, Integer quantity, BigDecimal subtotal, String size, String variantName
    ) {}

    public record OrderRefundLogDto(
            UUID id, String action, String reason, LocalDateTime createdAt
    ) {}

    public record OrderDto(
            UUID id, String orderNumber, BigDecimal totalAmount, BigDecimal shippingCost, OrderStatus status,
            String shippingAddress, String phone, String paymentMethod,
            LocalDateTime createdAt, LocalDateTime deliveredAt,
            List<OrderItemDto> items,
            String customerName, String customerEmail,
            String country, String city, String zipCode,
            boolean refundRequested, String refundReason,
            boolean refundApproved, boolean refundRejected, String refundRejectionReason,
            List<OrderRefundLogDto> refundLogs
    ) {}

    public record PlaceOrderRequest(
            @NotBlank String shippingAddress,
            @NotBlank String phone,
            String paymentMethod,
            @NotBlank String country,
            @NotBlank String city,
            String zipCode
    ) {}

    public record UpdateStatusRequest(OrderStatus status) {}
}
