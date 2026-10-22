package online.shop.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.shop.DTOs.AuthDtos.*;
import online.shop.Services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails ud) {
        if (ud == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(authService.getProfile(ud.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateMe(@AuthenticationPrincipal UserDetails ud,
                                                @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(authService.updateProfile(ud.getUsername(), req));
    }
}
