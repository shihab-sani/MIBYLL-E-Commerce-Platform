package online.shop.Services;

import online.shop.DTOs.AuthDtos.*;
import lombok.RequiredArgsConstructor;
import online.shop.Entity.Role;
import online.shop.Entity.User;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email().toLowerCase())) {
            throw ApiException.badRequest("Email already registered");
        }

        User user = User.builder()
                .fullName(req.fullName())
                .email(req.email().toLowerCase())
                .password(passwordEncoder.encode(req.password()))
                .phone(req.phone())
                .address(req.address())
                .country(req.country())
                .city(req.city())
                .zipCode(req.zipCode())
                .role(Role.ROLE_CUSTOMER)
                .build();

        userRepository.save(user);

        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(ud,
                Map.of("role", user.getRole().name(), "uid", user.getId()));

        return new AuthResponse(token, "Bearer", user.getId(), user.getFullName(),
                user.getEmail(), user.getRole().name(), user.getPhone(), user.getAddress());
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().toLowerCase(), req.password()));

        User user = userRepository.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> ApiException.notFound("User not found"));

        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(ud,
                Map.of("role", user.getRole().name(), "uid", user.getId()));

        return new AuthResponse(token, "Bearer", user.getId(), user.getFullName(),
                user.getEmail(), user.getRole().name(), user.getPhone(), user.getAddress());
    }

    @Transactional(readOnly = true)
    public UserProfile getProfile(String email) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return new UserProfile(u.getId(), u.getFullName(), u.getEmail(),
                u.getPhone(), u.getAddress(), u.getCountry(), u.getCity(), u.getZipCode(), u.getRole().name());
    }

    @Transactional
    public UserProfile updateProfile(String email, UpdateProfileRequest req) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        // ---- email change ----
        if (req.email() != null && !req.email().isBlank()
                && !req.email().equalsIgnoreCase(u.getEmail())) {
            String newEmail = req.email().toLowerCase();
            if (userRepository.existsByEmail(newEmail)) {
                throw ApiException.badRequest("Email already in use");
            }
            u.setEmail(newEmail);
        }

        // ---- password change ----
        if (req.newPassword() != null && !req.newPassword().isBlank()) {
            if (req.newPassword().length() < 6) {
                throw ApiException.badRequest("Password must be at least 6 characters");
            }
            if (req.currentPassword() == null || req.currentPassword().isBlank()) {
                throw ApiException.badRequest("Current password is required");
            }
            if (!passwordEncoder.matches(req.currentPassword(), u.getPassword())) {
                throw ApiException.badRequest("Current password is incorrect");
            }
            u.setPassword(passwordEncoder.encode(req.newPassword()));
        }

        // ---- simple fields ----
        if (req.fullName() != null && !req.fullName().isBlank()) u.setFullName(req.fullName());
        if (req.phone()    != null) u.setPhone(req.phone());
        if (req.address()  != null && !req.address().isBlank()) u.setAddress(req.address());
        if (req.country()  != null) u.setCountry(req.country());
        if (req.city()     != null) u.setCity(req.city());
        if (req.zipCode()  != null) u.setZipCode(req.zipCode());

        userRepository.save(u);
        return getProfile(u.getEmail());
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }
}
