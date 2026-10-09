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
            BigDecimal unitPrice, Integer quantity, BigDecimal subtotal, String size
    ) {}

    public record OrderDto(
            UUID id, String orderNumber, BigDecimal totalAmount, OrderStatus status,
            String shippingAddress, String phone, String paymentMethod,
            LocalDateTime createdAt, List<OrderItemDto> items,
            String customerName, String customerEmail
    ) {}

    public record PlaceOrderRequest(
            @NotBlank String shippingAddress,
            @NotBlank String phone,
            String paymentMethod
    ) {}

    public record UpdateStatusRequest(OrderStatus status) {}
}
