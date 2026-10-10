package online.shop.DTOs;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class DashboardDto {
    public record KpiCards(
            BigDecimal totalRevenue,
            long totalOrders,
            long totalCustomers,
            long totalProducts,
            long lowStockCount,
            long pendingOrders
    ) {}

    public record MonthlySales(String month, BigDecimal revenue, long orders) {}

    public record TopProduct(UUID productId, String name, long unitsSold, BigDecimal revenue) {}

    public record DashboardResponse(
            KpiCards kpis,
            List<MonthlySales> monthlySales,
            List<TopProduct> topProducts,
            List<OrderDtos.OrderDto> recentOrders
    ) {}
}
