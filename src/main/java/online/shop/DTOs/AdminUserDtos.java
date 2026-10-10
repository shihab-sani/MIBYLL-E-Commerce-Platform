package online.shop.DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminUserDtos {
    public record SubAdminDto(
            UUID id,
            String fullName,
            String email,
            String phone,
            LocalDateTime createdAt
    ) {}

    public record CreateSubAdminRequest(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password,
            String phone
    ) {}
}
