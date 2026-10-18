package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.OrderDtos.*;
import online.shop.Entity.*;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.CartRepository;
import online.shop.Repositories.OrderRepository;
import online.shop.Repositories.ProductRepository;
import online.shop.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    @Transactional
    public OrderDto placeOrder(String email, PlaceOrderRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Cart cart = cartService.getOrCreateCart(user);

        if (cart.getItems().isEmpty()) {
            throw ApiException.badRequest("Your cart is empty");
        }

        BigDecimal shippingCost = BigDecimal.ZERO;
        if ("BD".equalsIgnoreCase(req.country())) {
            if (req.city() != null && req.city().equalsIgnoreCase("Dhaka")) {
                shippingCost = new BigDecimal("60");
            } else {
                shippingCost = new BigDecimal("120");
            }
        } else {
            shippingCost = new BigDecimal("2500");
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

        return new OrderDto(
                o.getId(), o.getOrderNumber(), o.getTotalAmount(), o.getShippingCost(), o.getStatus(),
                o.getShippingAddress(), o.getPhone(), o.getPaymentMethod(),
                o.getCreatedAt(), items,
                o.getUser().getFullName(), o.getUser().getEmail(),
                o.getCountry(), o.getCity(), o.getZipCode()
        );
    }
}
