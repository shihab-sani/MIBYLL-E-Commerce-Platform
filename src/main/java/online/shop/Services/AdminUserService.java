package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.AdminUserDtos.*;
import online.shop.Entity.Role;
import online.shop.Entity.User;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<SubAdminDto> listSubAdmins() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_SUBADMIN)
                .map(u -> new SubAdminDto(u.getId(), u.getFullName(), u.getEmail(),
                        u.getPhone(), u.getCreatedAt()))
                .toList();
    }

    @Transactional
    public SubAdminDto createSubAdmin(CreateSubAdminRequest req) {
        if (userRepository.existsByEmail(req.email().toLowerCase())) {
            throw ApiException.badRequest("Email already registered");
        }

        User u = User.builder()
                .fullName(req.fullName())
                .email(req.email().toLowerCase())
                .password(passwordEncoder.encode(req.password()))
                .phone(req.phone())
                .role(Role.ROLE_SUBADMIN)
                .build();

        userRepository.save(u);
        return new SubAdminDto(u.getId(), u.getFullName(), u.getEmail(),
                u.getPhone(), u.getCreatedAt());
    }

    @Transactional
    public void deleteSubAdmin(UUID id, String requesterEmail) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        // Never allow deleting a full admin
        if (u.getRole() == Role.ROLE_ADMIN) {
            throw ApiException.badRequest("Cannot delete the primary admin account");
        }
        if (u.getRole() != Role.ROLE_SUBADMIN) {
            throw ApiException.badRequest("Not a sub-admin");
        }
        if (u.getEmail().equalsIgnoreCase(requesterEmail)) {
            throw ApiException.badRequest("You cannot delete your own account");
        }
        userRepository.delete(u);
    }
}
