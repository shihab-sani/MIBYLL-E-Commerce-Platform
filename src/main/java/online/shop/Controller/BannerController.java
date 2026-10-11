package online.shop.Controller;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.BannerDtos.BannerDto;
import online.shop.Services.BannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<BannerDto>> list(
            @RequestParam(required = false) String position) {
        return ResponseEntity.ok(bannerService.getActive(position));
    }
}
