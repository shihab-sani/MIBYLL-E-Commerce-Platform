package online.shop.DTOs;

import java.util.UUID;

public class CofferDtos {
    public record CofferDto(UUID id, String year, String title, String description, String imageUrl, Integer displayOrder) {}
    public record CofferRequest(String year, String title, String description, String imageUrl, Integer displayOrder) {}
}
