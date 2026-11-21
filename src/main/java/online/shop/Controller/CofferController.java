package online.shop.Controller;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.CofferDtos;
import online.shop.Services.CofferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/coffer")
@RequiredArgsConstructor
public class CofferController {
    private final CofferService cofferService;

    @GetMapping
    public ResponseEntity<List<CofferDtos.CofferDto>> getCoffer() {
        return ResponseEntity.ok(cofferService.getAll());
    }
}
