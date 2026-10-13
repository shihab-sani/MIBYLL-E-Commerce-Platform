package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.CartDtos.*;
import online.shop.Entity.Cart;
import online.shop.Entity.CartItem;
import online.shop.Entity.Product;
import online.shop.Entity.User;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.CartItemRepository;
import online.shop.Repositories.CartRepository;
import online.shop.Repositories.ProductRepository;
import online.shop.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;   // <-- NEW

    /* ------------------------------------------------------------- */
    /* Public API now takes the authenticated user's EMAIL            */
    /* so the User entity is loaded inside the transaction.           */
    /* ------------------------------------------------------------- */

    @Transactional
    public CartDto getCart(String email) {
        User user = loadUser(email);
        Cart cart = getOrCreateCart(user);
        return toDto(cart);
    }

    @Transactional
    public CartDto addItem(String email, AddToCartRequest req) {
        User user = loadUser(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        if (!product.isActive()) throw ApiException.badRequest("Product is not available");
        if (product.getStockQuantity() < req.quantity())
            throw ApiException.badRequest("Only " + product.getStockQuantity() + " items in stock");

        String size = req.size() == null ? "" : req.size();

        CartItem existing = cartItemRepository
                .findByCartIdAndProductIdAndSize(cart.getId(), product.getId(), size)
                .orElse(null);

        if (existing != null) {
            int newQty = existing.getQuantity() + req.quantity();
            if (newQty > product.getStockQuantity())
                throw ApiException.badRequest("Only " + product.getStockQuantity() + " items in stock");
            existing.setQuantity(newQty);
        } else {
            cart.getItems().add(CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(req.quantity())
                    .size(size)
                    .build());
        }

        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto updateItem(String email, Long itemId, int quantity) {
        User user = loadUser(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> ApiException.notFound("Cart item not found"));

        if (quantity > item.getProduct().getStockQuantity())
            throw ApiException.badRequest("Only " + item.getProduct().getStockQuantity() + " in stock");

        item.setQuantity(quantity);
        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto removeItem(String email, Long itemId) {
        User user = loadUser(email);
        Cart cart = getOrCreateCart(user);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public void clearCart(String email) {
        User user = loadUser(email);
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    /** Used by OrderService — must be called inside an existing transaction. */
    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    /* -------------------------- helpers -------------------------- */

    private User loadUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    public CartDto toDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream().map(i -> new CartItemDto(
                i.getId(),
                i.getProduct().getId(),
                i.getProduct().getName(),
                i.getProduct().getSlug(),
                i.getProduct().getImages().isEmpty() ? null
                        : i.getProduct().getImages().get(0).getImageUrl(),
                i.getProduct().getFinalPrice(),
                i.getQuantity(),
                i.getSize(),
                i.getLineTotal(),
                i.getProduct().getStockQuantity()
        )).toList();

        BigDecimal subtotal = items.stream()
                .map(CartItemDto::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal savings = cart.getItems().stream()
                .map(i -> i.getProduct().getPrice()
                        .subtract(i.getProduct().getFinalPrice())
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream().mapToInt(CartItemDto::quantity).sum();

        return new CartDto(cart.getId(), items, subtotal, savings, totalItems);
    }

}
