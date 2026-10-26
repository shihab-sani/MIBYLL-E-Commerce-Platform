package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.RequestDtos.*;
import online.shop.Entity.CustomerRequest;
import online.shop.Entity.Product;
import online.shop.Entity.User;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.CustomerRequestRepository;
import online.shop.Repositories.ProductRepository;
import online.shop.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestService {
    private final CustomerRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void createRequest(String email, CreateRequestDto req) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));
        Product product = productRepository.findById(req.productId()).orElseThrow(() -> ApiException.notFound("Product not found"));

        requestRepository.save(CustomerRequest.builder()
                .user(user)
                .product(product)
                .message(req.message())
                .build());
    }

    @Transactional(readOnly = true)
    public List<RequestDto> getMyRequests(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));
        return requestRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<RequestDto> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    private RequestDto toDto(CustomerRequest r) {
        String img = r.getProduct().getImages().isEmpty() ? null : r.getProduct().getImages().get(0).getImageUrl();
        return new RequestDto(
                r.getId(), r.getUser().getFullName(), r.getUser().getEmail(),
                r.getProduct().getId(), r.getProduct().getName(), img,
                r.getMessage(), r.getStatus(), r.getCreatedAt()
        );
    }
}
