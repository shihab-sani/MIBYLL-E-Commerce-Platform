package online.shop.DTOs;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class CategoryDtos {
    public record CategoryDto(
            UUID id, String name, String slug, String description, String imageUrl,
            java.util.List<CategoryDto> subcategories
    ) {}

    public record CategoryRequest(
            String name, String slug, String description, String imageUrl,
            UUID parentId
    ) {}
}
