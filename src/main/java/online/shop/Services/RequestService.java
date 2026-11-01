package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.ProductDtos.*;
import online.shop.DTOs.RequestDtos.*;
import online.shop.Entity.CustomerRequest;
import online.shop.Entity.Product;
import online.shop.Entity.RequestMessage;
import online.shop.Entity.User;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.CustomerRequestRepository;
import online.shop.Repositories.ProductRepository;
import online.shop.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {
    private final CustomerRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void createRequest(String email, CreateRequestDto req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Product product = productRepository.findById(req.productId()).orElseThrow();

        CustomerRequest request = CustomerRequest.builder()
                .user(user).product(product)
                .size(req.size()).variantName(req.variantName())
                .build();

        RequestMessage firstMsg = RequestMessage.builder()
                .request(request).senderRole("CUSTOMER").message(req.message()).build();
        request.getMessages().add(firstMsg);

        requestRepository.save(request);
    }

    @Transactional
    public void reply(UUID requestId, String role, String text) {
        CustomerRequest req = requestRepository.findById(requestId).orElseThrow();

        RequestMessage msg = RequestMessage.builder()
                .request(req).senderRole(role).message(text).build();

        if ("ADMIN".equals(role)) {
            msg.setReadByAdmin(true);
            req.setStatus("REPLIED");
        } else {
            msg.setReadByCustomer(true);
            req.setStatus("PENDING"); // Pending admin reply
        }

        req.getMessages().add(msg);
        requestRepository.save(req);
    }

    @Transactional
    public void markAsRead(UUID requestId, String role) {
        CustomerRequest req = requestRepository.findById(requestId).orElseThrow();
        for (RequestMessage msg : req.getMessages()) {
            if ("CUSTOMER".equals(role) && "ADMIN".equals(msg.getSenderRole())) msg.setReadByCustomer(true);
            if ("ADMIN".equals(role) && "CUSTOMER".equals(msg.getSenderRole())) msg.setReadByAdmin(true);
        }
        requestRepository.save(req);
    }

    @Transactional
    public void markAllAsRead(String email, String role) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<CustomerRequest> requests = requestRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        for (CustomerRequest req : requests) {
            for (RequestMessage msg : req.getMessages()) {
                if ("CUSTOMER".equals(role) && "ADMIN".equals(msg.getSenderRole())) msg.setReadByCustomer(true);
                if ("ADMIN".equals(role) && "CUSTOMER".equals(msg.getSenderRole())) msg.setReadByAdmin(true);
            }
            requestRepository.save(req);
        }
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

    @Transactional
    public RequestDto updateStatus(UUID id, String status) {
        // FIXED: Changed ProductRequest to CustomerRequest
        CustomerRequest req = requestRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Request not found"));

        req.setStatus(status);

        return toDto(requestRepository.save(req));
    }

    private RequestDto toDto(CustomerRequest r) {
        String img = r.getProduct().getImages().isEmpty() ? null : r.getProduct().getImages().get(0).getImageUrl();

        List<MessageDto> msgs = r.getMessages().stream()
                .map(m -> new MessageDto(m.getId(), m.getSenderRole(), m.getMessage(), m.getCreatedAt()))
                .toList();

        boolean unreadC = r.getMessages().stream().anyMatch(m -> !m.isReadByCustomer() && "ADMIN".equals(m.getSenderRole()));
        boolean unreadA = r.getMessages().stream().anyMatch(m -> !m.isReadByAdmin() && "CUSTOMER".equals(m.getSenderRole()));

        return new RequestDto(r.getId(), r.getUser().getFullName(), r.getUser().getEmail(),
                r.getProduct().getId(), r.getProduct().getName(), img,
                r.getSize(), r.getVariantName(), r.getStatus(), msgs, unreadC, unreadA, r.getCreatedAt());
    }
}
