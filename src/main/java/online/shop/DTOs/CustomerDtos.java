package online.shop.DTOs;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CustomerDtos {
    public record CustomerDto(
            UUID id,
            String fullName,
            String email,
            String phone,
            String address,
            LocalDateTime createdAt,
            long orderCount,
            BigDecimal totalSpent,
            List<OrderDtos.OrderDto> orders
    ) {}
}
