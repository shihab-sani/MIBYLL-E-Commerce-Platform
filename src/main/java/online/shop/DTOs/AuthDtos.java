package online.shop.DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class AuthDtos {
    public record RegisterRequest(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String password,
            String phone,
            @NotBlank(message = "Address is required") String address,
            String country,
            String city,
            String zipCode
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            String token,
            String tokenType,
            UUID id,
            String fullName,
            String email,
            String role,
            String phone,
            String address
    ) {}

    public record UserProfile(
            UUID id,
            String fullName,
            String email,
            String phone,
            String address,
            String role,
            String country,
            String city,
            String zipCode
    ) {}

    public record UpdateProfileRequest(
            String fullName,
            String email,
            String phone,
            String address,
            String country,
            String city,
            String zipCode,
            String currentPassword,
            String newPassword
    ) {}
}
