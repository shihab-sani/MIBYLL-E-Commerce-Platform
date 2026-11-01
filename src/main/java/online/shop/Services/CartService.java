package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.CartDtos.*;
import online.shop.DTOs.ProductDtos.*;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

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
        String variant = req.variantName() == null ? "" : req.variantName();

        CartItem existing = cartItemRepository
                .findByCartIdAndProductIdAndSizeAndVariantName(cart.getId(), product.getId(), size, variant)
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
                    .variantName(variant)
                    .build());
        }

        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto updateItem(String email, UUID itemId, int quantity, String newSize, String newVariant) {
        User user = loadUser(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> ApiException.notFound("Cart item not found"));

        if (quantity > item.getProduct().getStockQuantity())
            throw ApiException.badRequest("Only " + item.getProduct().getStockQuantity() + " in stock");

        String targetSize = (newSize == null || newSize.isBlank()) ? item.getSize() : newSize;
        String targetVariant = (newVariant == null || newVariant.isBlank()) ? item.getVariantName() : newVariant;

        boolean isChanging = !targetSize.equals(item.getSize()) || !targetVariant.equals(item.getVariantName());

        if (isChanging) {
            CartItem existing = cartItemRepository
                    .findByCartIdAndProductIdAndSizeAndVariantName(cart.getId(), item.getProduct().getId(), targetSize, targetVariant)
                    .orElse(null);

            if (existing != null && !existing.getId().equals(itemId)) {
                int newQty = existing.getQuantity() + quantity;
                if (newQty > item.getProduct().getStockQuantity())
                    throw ApiException.badRequest("Only " + item.getProduct().getStockQuantity() + " in stock");
                existing.setQuantity(newQty);
                cart.getItems().remove(item);
            } else {
                item.setSize(targetSize);
                item.setVariantName(targetVariant);
                item.setQuantity(quantity);
            }
        } else {
            item.setQuantity(quantity);
        }

        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto removeItem(String email, UUID itemId) {
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

    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private User loadUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    public CartDto toDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream().map(i -> {

            // Find the image URL for the selected variant
            String imgUrl = null;
            if (i.getVariantName() != null && !i.getVariantName().isBlank()) {
                imgUrl = i.getProduct().getVariants().stream()
                        .filter(v -> v.getName().equalsIgnoreCase(i.getVariantName()))
                        .map(online.shop.Entity.ProductVariant::getImageUrl)
                        .filter(url -> url != null && !url.isBlank())
                        .findFirst()
                        .orElse(null);
            }

            if (imgUrl == null) {
                imgUrl = i.getProduct().getImages().isEmpty() ? null : i.getProduct().getImages().get(0).getImageUrl();
            }

            return new CartItemDto(
                    i.getId(),
                    i.getProduct().getId(),
                    i.getProduct().getName(),
                    i.getProduct().getSlug(),
                    imgUrl,
                    i.getProduct().getFinalPrice(),
                    i.getQuantity(),
                    i.getSize(),
                    i.getLineTotal(),
                    i.getProduct().getStockQuantity(),
                    i.getVariantName(),
                    i.getProduct().getSizeType(),
                    // FIX: Convert Entity to DTO here
                    i.getProduct().getVariants().stream()
                            .map(v -> new VariantDto(v.getId(), v.getName(), v.getImageUrl()))
                            .toList()
            );
        }).toList();

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
