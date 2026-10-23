package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.OrderDtos.*;
import online.shop.Entity.*;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final SiteSettingsService siteSettingsService;
    private final OrderRefundLogRepository refundLogRepository;

    @Transactional
    public OrderDto placeOrder(String email, PlaceOrderRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        User admin = userRepository.findFirstByRole(Role.ROLE_ADMIN)
                .orElseThrow(() -> ApiException.notFound("Admin not found"));

        SiteSettings settings = siteSettingsService.get();

        Cart cart = cartService.getOrCreateCart(user);

        if (cart.getItems().isEmpty()) {
            throw ApiException.badRequest("Your cart is empty");
        }

        String adminCountry = (admin != null && admin.getCountry() != null) ? admin.getCountry() : "BD";
        String adminCity = (admin != null && admin.getCity() != null) ? admin.getCity() : "Dhaka";

        String reqCountry = req.country() != null ? req.country() : "BD";
        String reqCity = req.city() != null ? req.city() : "";

        BigDecimal localRate = settings.getLocalDeliveryCharge() != null ? settings.getLocalDeliveryCharge() : new BigDecimal("60");
        BigDecimal domesticRate = settings.getDomesticDeliveryCharge() != null ? settings.getDomesticDeliveryCharge() : new BigDecimal("120");
        BigDecimal internationalRate = settings.getInternationalDeliveryCharge() != null ? settings.getInternationalDeliveryCharge() : new BigDecimal("3500");

        // Calculate Shipping
        BigDecimal shippingCost;
        if (!adminCountry.equalsIgnoreCase(reqCountry)) {
            shippingCost = internationalRate;
        } else if (!adminCity.equalsIgnoreCase(reqCity)) {
            shippingCost = domesticRate;
        } else {
            shippingCost = localRate;
        }

        Order order = Order.builder()
                .orderNumber("ORD-" + System.currentTimeMillis())
                .user(user)
                .shippingAddress(req.shippingAddress())
                .phone(req.phone())
                .paymentMethod(req.paymentMethod() == null ? "COD" : req.paymentMethod())
                .country(req.country())
                .city(req.city())
                .zipCode(req.zipCode())
                .shippingCost(shippingCost)
                .status(OrderStatus.PENDING)
                .build();

        BigDecimal itemsTotal = BigDecimal.ZERO;

        for (CartItem ci : cart.getItems()) {
            Product p = ci.getProduct();

            if (p.getStockQuantity() < ci.getQuantity()) {
                throw ApiException.badRequest("Insufficient stock for " + p.getName());
            }

            BigDecimal unitPrice = p.getFinalPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));

            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .product(p)
                    .productName(p.getName())
                    .imageUrl(p.getImages().isEmpty() ? null : p.getImages().get(0).getImageUrl())
                    .unitPrice(unitPrice)
                    .quantity(ci.getQuantity())
                    .subtotal(subtotal)
                    .size(ci.getSize())
                    .build());

            p.setStockQuantity(p.getStockQuantity() - ci.getQuantity());
            productRepository.save(p);

            itemsTotal = itemsTotal.add(subtotal);
        }

        order.setTotalAmount(itemsTotal.add(shippingCost));
        Order saved = orderRepository.save(order);

        cart.getItems().clear();
        cartRepositorySave(cart);

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> myOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderDto> allOrders(int page, int size) {
        return orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public OrderDto updateStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        order.setStatus(status);
        if (status == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto cancelOrder(String email, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));

        if (!order.getUser().getEmail().equalsIgnoreCase(email)) {
            throw ApiException.badRequest("Unauthorized");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw ApiException.badRequest("Cannot cancel order at this stage");
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product p = item.getProduct();
                p.setStockQuantity(p.getStockQuantity() + item.getQuantity());
                productRepository.save(p);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto requestRefund(String email, UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));

        if (!order.getUser().getEmail().equalsIgnoreCase(email)) throw ApiException.badRequest("Unauthorized");
        if (order.getStatus() != OrderStatus.DELIVERED) throw ApiException.badRequest("Only delivered orders can be refunded");
        if (order.isRefundRequested()) throw ApiException.badRequest("Refund already requested");

        if (order.getDeliveredAt() != null) {
            long days = java.time.Duration.between(order.getDeliveredAt(), LocalDateTime.now()).toDays();
            if (days >= 2) throw ApiException.badRequest("Refund window (2 days) has expired");
        }

        order.setRefundRequested(true);
        order.setRefundReason(reason);
        order.setRefundRejected(false);
        order.setRefundRejectionReason(null);

        refundLogRepository.save(OrderRefundLog.builder().order(order).action("REQUESTED").reason(reason).build());

        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto approveRefund(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));


        order.setRefundApproved(true);
        order.setRefundRequested(false);
        order.setRefundRejected(false);
        order.setStatus(OrderStatus.REFUNDED);

        OrderRefundLog log = OrderRefundLog.builder()
                .order(order)
                .action("APPROVED")
                .reason("Refund approved by admin")
                .build();
        refundLogRepository.save(log);

        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto rejectRefund(UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));

        order.setRefundRequested(false);
        order.setRefundApproved(false);
        order.setRefundRejected(true);
        order.setRefundRejectionReason(reason);

        refundLogRepository.save(OrderRefundLog.builder().order(order).action("REJECTED").reason(reason).build());

        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto cancelRefundRequest(String email, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (!order.getUser().getEmail().equalsIgnoreCase(email)) throw ApiException.badRequest("Unauthorized");
        if (order.isRefundApproved()) throw ApiException.badRequest("Cannot cancel an already approved refund");

        order.setRefundRequested(false);
        order.setRefundRejected(false);
        order.setRefundRejectionReason(null);

        refundLogRepository.save(OrderRefundLog.builder().order(order).action("CANCELLED").reason("Cancelled by customer").build());

        return toDto(orderRepository.save(order));
    }

    /* ---- helper: avoid adding another dep just to clear the cart ---- */
    @Autowired
    private CartRepository cartRepository;

    private void cartRepositorySave(Cart cart) {
        cartRepository.save(cart);
    }

    public OrderDto toDto(Order o) {
        List<OrderItemDto> items = o.getItems().stream().map(i -> new OrderItemDto(
                i.getId(),
                i.getProduct() != null ? i.getProduct().getId() : null,
                i.getProductName(),
                i.getImageUrl(),
                i.getUnitPrice(),
                i.getQuantity(),
                i.getSubtotal(),
                i.getSize()
        )).toList();

        List<OrderRefundLogDto> logs = o.getRefundLogs().stream()
                .map(l -> new OrderRefundLogDto(l.getId(), l.getAction(), l.getReason(), l.getCreatedAt()))
                .toList();

        return new OrderDto(
                o.getId(), o.getOrderNumber(), o.getTotalAmount(), o.getShippingCost(), o.getStatus(),
                o.getShippingAddress(), o.getPhone(), o.getPaymentMethod(),
                o.getCreatedAt(), o.getDeliveredAt(), items,
                o.getUser().getFullName(), o.getUser().getEmail(),
                o.getCountry(), o.getCity(), o.getZipCode(),
                o.isRefundRequested(), o.getRefundReason(), o.isRefundApproved(), o.isRefundRejected(), o.getRefundRejectionReason(),
                logs
        );
    }
}
