package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.ProductDtos;
import online.shop.Entity.User;
import online.shop.Entity.WishListItem;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.ProductRepository;
import online.shop.Repositories.UserRepository;
import online.shop.Repositories.WishListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WishListService {
    private final WishListRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<ProductDtos.ProductDto> getWishlist(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(item -> productService.toDto(item.getProduct())).toList();
    }

    @Transactional(readOnly = true)
    public List<UUID> getWishlistIds(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(item -> item.getProduct().getId()).toList();
    }

    @Transactional
    public void toggleWishlist(String email, UUID productId) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));

        var existing = wishlistRepository.findByUserIdAndProductId(user.getId(), productId);

        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
        } else {
            var product = productRepository.findById(productId).orElseThrow(() -> ApiException.notFound("Product not found"));
            wishlistRepository.save(WishListItem.builder().user(user).product(product).build());
        }
    }
}
