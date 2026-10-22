package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.CustomerDtos.*;
import online.shop.DTOs.DashboardDto.*;
import online.shop.DTOs.OrderDtos.*;
import online.shop.Entity.*;
import online.shop.Repositories.OrderRepository;
import online.shop.Repositories.ProductRepository;
import online.shop.Repositories.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {

        List<Order> orders = orderRepository.findAll();

        List<Order> validOrders = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.REFUNDED)
                .toList();

        BigDecimal totalRevenue = validOrders.stream()
                .map(o -> o.getTotalAmount().subtract(o.getShippingCost() != null ? o.getShippingCost() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pending = orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();

        KpiCards kpis = new KpiCards(
                totalRevenue,
                orders.size(),
                userRepository.countByRole(Role.ROLE_CUSTOMER),
                productRepository.count(),
                productRepository.countByStockQuantityLessThan(5),
                pending
        );

        // ---- monthly sales (last 12 months) ----
        Map<String, List<Order>> byMonth = validOrders.stream()
                .collect(Collectors.groupingBy(o ->
                        o.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"))));

        List<MonthlySales> monthly = new ArrayList<>();
        YearMonth start = YearMonth.now().minusMonths(11);
        for (int i = 0; i < 12; i++) {
            YearMonth ym = start.plusMonths(i);
            String key = ym.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            List<Order> list = byMonth.getOrDefault(key, List.of());
            BigDecimal rev = list.stream().map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            monthly.add(new MonthlySales(key, rev, list.size()));
        }

        // ---- top products ----
        Map<UUID, long[]> units = new HashMap<>();
        Map<UUID, BigDecimal> revenue = new HashMap<>();
        Map<UUID, String> names = new HashMap<>();

        for (Order o : validOrders) {
            for (OrderItem it : o.getItems()) {
                UUID pid = it.getProduct() != null ? it.getProduct().getId() : null;
                names.putIfAbsent(pid, it.getProductName());
                units.computeIfAbsent(pid, k -> new long[1])[0] += it.getQuantity();
                revenue.merge(pid, it.getSubtotal(), BigDecimal::add);
            }
        }

        List<TopProduct> top = units.entrySet().stream()
                .map(e -> new TopProduct(e.getKey(), names.get(e.getKey()),
                        e.getValue()[0], revenue.get(e.getKey())))
                .sorted(Comparator.comparingLong(TopProduct::unitsSold).reversed())
                .limit(5)
                .toList();

        // ---- recent orders ----
        var recent = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 8))
                .stream().map(orderService::toDto).toList();

        return new DashboardResponse(kpis, monthly, top, recent);
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> getCustomers() {

        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_CUSTOMER)
                .toList();

        List<CustomerDto> result = new ArrayList<>();

        for (User c : customers) {
            List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(c.getId());

            BigDecimal spent = orders.stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<OrderDto> orderDtos = orders.stream()
                    .map(orderService::toDto)
                    .toList();

            result.add(new CustomerDto(
                    c.getId(),
                    c.getFullName(),
                    c.getEmail(),
                    c.getPhone(),
                    c.getAddress(),
                    c.getCreatedAt(),
                    orders.size(),
                    spent,
                    orderDtos
            ));
        }

        // newest sign-ups first
        result.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));
        return result;
    }
}
